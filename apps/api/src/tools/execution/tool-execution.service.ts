import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ToolRegistryService } from '../registry/tool-registry.service';
import { ToolPolicyService } from '../policy/tool-policy.service';
import {
  AuthorizedExecutionContext,
  ToolResult,
} from '@adaptive-planner/tool-sdk';

@Injectable()
export class ToolExecutionService {
  private readonly logger = new Logger(ToolExecutionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: ToolRegistryService,
    private readonly policy: ToolPolicyService,
  ) {}

  async executeTool(
    agentRunId: string,
    toolName: string,
    inputPayload: unknown,
    context: AuthorizedExecutionContext,
  ): Promise<ToolResult> {
    const lookup = this.registry.findTool(toolName);
    if (!lookup) {
      throw new NotFoundException(`Tool '${toolName}' is not registered`);
    }

    const { adapter, tool } = lookup;

    // 1. Evaluate Risk Policy
    const policyDecision = this.policy.evaluateToolPolicy(tool.riskLevel);
    if (!policyDecision.allowed && !policyDecision.requiresApproval) {
      throw new ForbiddenException(
        `Execution forbidden by server policy: ${policyDecision.reason}`,
      );
    }

    // 2. Check if human approval is required
    if (policyDecision.requiresApproval) {
      this.logger.warn(
        `Tool '${toolName}' flagged for approval. Risk: ${tool.riskLevel}`,
      );

      if (this.prisma.isConnected) {
        const toolCall = await this.prisma.toolCall.create({
          data: {
            agentRunId,
            toolName,
            inputPayload: inputPayload as any,
            inputSummary: `Proposed call to ${toolName} with risk level ${tool.riskLevel}`,
            riskLevel: tool.riskLevel as any,
            status: 'PENDING',
            approval: {
              create: {
                workspaceId: context.workspaceId,
                requestedById: context.userId,
                actionSummary: `Approve execution of tool ${toolName}`,
                riskLevel: tool.riskLevel as any,
                status: 'PENDING',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
              },
            },
          },
          include: { approval: true },
        });

        return {
          success: false,
          summary: `Action requires human confirmation. Approval ID: ${toolCall.approval?.id}`,
          errorCode: 'REQUIRES_APPROVAL',
        };
      }

      return {
        success: false,
        summary: `Action requires human confirmation. Risk level: ${tool.riskLevel}`,
        errorCode: 'REQUIRES_APPROVAL',
      };
    }

    // 3. Execute through adapter
    const startTime = Date.now();
    let result: ToolResult;

    try {
      result = await adapter.execute(toolName, inputPayload, context);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Execution failure in tool ${toolName}: ${message}`);
      result = {
        success: false,
        summary: `Execution failed: ${message}`,
        errorMessage: message,
      };
    }

    const durationMs = Date.now() - startTime;
    this.logger.log(`Tool ${toolName} finished in ${durationMs}ms (success: ${result.success})`);

    // 4. Persist tool call and audit event
    if (this.prisma.isConnected) {
      try {
        await this.prisma.toolCall.create({
          data: {
            agentRunId,
            toolName,
            inputPayload: inputPayload as any,
            inputSummary: `Executed ${toolName}`,
            riskLevel: tool.riskLevel as any,
            status: result.success ? 'COMPLETED' : 'FAILED',
            resultPayload: (result.data || null) as any,
            resultSummary: result.summary,
            error: result.errorMessage,
            executedAt: new Date(),
          },
        });

        await this.prisma.auditEvent.create({
          data: {
            workspaceId: context.workspaceId,
            actorId: context.userId,
            actorType: 'AGENT',
            action: `tool_execute:${toolName}`,
            targetType: 'tool_call',
            targetId: toolName,
            metadata: {
              success: result.success,
              durationMs,
              traceId: context.traceId,
            },
          },
        });
      } catch (dbErr) {
        this.logger.error(`Failed to record tool execution audit: ${dbErr}`);
      }
    }

    return result;
  }
}
