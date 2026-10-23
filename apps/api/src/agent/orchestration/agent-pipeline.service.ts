import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GeminiGatewayService } from '../model-gateway/gemini-gateway.service';
import { ToolRegistryService } from '../../tools/registry/tool-registry.service';
import { ToolExecutionService } from '../../tools/execution/tool-execution.service';
import {
  AuthenticatedUserContext,
  StartAgentRunDto,
  AgentRunResponseDto,
} from '@adaptive-planner/contracts';

@Injectable()
export class AgentPipelineService {
  private readonly logger = new Logger(AgentPipelineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiGatewayService,
    private readonly registry: ToolRegistryService,
    private readonly executor: ToolExecutionService,
  ) {}

  async startRun(
    dto: StartAgentRunDto,
    user: AuthenticatedUserContext,
  ): Promise<AgentRunResponseDto> {
    const runId = `run_${Date.now()}`;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    this.logger.log(`Starting agent run ${runId} for user ${user.userId}`);

    // Step 1: Request & Context
    let contextSummary = `User: ${user.displayName}, Workspace: ${user.workspaceId}`;
    if (this.prisma.isConnected) {
      const memories = await this.prisma.userMemory.findMany({
        where: { workspaceId: user.workspaceId },
        take: 5,
      });
      if (memories.length) {
        contextSummary += ` | Stored Memories: ${memories.map((m) => m.content).join('; ')}`;
      }
    }

    // Step 2: Plan Generation with Gemini
    const availableTools = this.registry.getAllTools().map((t) => t.tool.name);
    const plan = await this.gemini.generateStructuredPlan(
      dto.prompt,
      contextSummary,
      availableTools,
    );

    // Step 3: Record Agent Run
    if (this.prisma.isConnected) {
      await this.prisma.agentRun.create({
        data: {
          id: runId,
          workspaceId: user.workspaceId,
          userId: user.userId,
          status: 'RUNNING',
          model,
          prompt: dto.prompt,
          planSummary: JSON.stringify(plan),
          startedAt: new Date(),
        },
      });
    }

    // Step 4: Execute first tool step if applicable
    let pendingApprovals = 0;
    const firstToolStep = plan.steps.find((s) => s.targetToolName);

    if (firstToolStep && firstToolStep.targetToolName) {
      const execContext = {
        userId: user.userId,
        workspaceId: user.workspaceId,
        allowedScopes: ['*'],
        traceId: `tr_${runId}`,
      };

      const result = await this.executor.executeTool(
        runId,
        firstToolStep.targetToolName,
        firstToolStep.toolInput || {},
        execContext,
      );

      if (result.errorCode === 'REQUIRES_APPROVAL') {
        pendingApprovals += 1;
        if (this.prisma.isConnected) {
          await this.prisma.agentRun.update({
            where: { id: runId },
            data: { status: 'WAITING_FOR_APPROVAL' },
          });
        }
      }
    } else {
      if (this.prisma.isConnected) {
        await this.prisma.agentRun.update({
          where: { id: runId },
          data: { status: 'SUCCEEDED', finishedAt: new Date() },
        });
      }
    }

    return {
      id: runId,
      workspaceId: user.workspaceId,
      status: pendingApprovals > 0 ? 'WAITING_FOR_APPROVAL' : 'SUCCEEDED',
      model,
      prompt: dto.prompt,
      planSummary: plan.intent,
      startedAt: new Date().toISOString(),
      finishedAt: pendingApprovals > 0 ? null : new Date().toISOString(),
      toolCallsCount: firstToolStep ? 1 : 0,
      pendingApprovalsCount: pendingApprovals,
      createdAt: new Date().toISOString(),
    };
  }

  async getRunById(id: string, user: AuthenticatedUserContext) {
    if (this.prisma.isConnected) {
      return this.prisma.agentRun.findFirst({
        where: { id, workspaceId: user.workspaceId },
        include: {
          toolCalls: {
            include: { approval: true },
          },
        },
      });
    }

    return {
      id,
      workspaceId: user.workspaceId,
      status: 'SUCCEEDED',
      model: 'gemini-2.5-flash',
      prompt: 'Sample agent prompt',
      planSummary: 'Plan executed successfully',
      toolCalls: [],
    };
  }
}
