import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
    private readonly modelGateway: GeminiGatewayService,
    private readonly registry: ToolRegistryService,
    private readonly executor: ToolExecutionService,
  ) {}

  async startRun(
    dto: StartAgentRunDto,
    user: AuthenticatedUserContext,
  ): Promise<AgentRunResponseDto> {
    const runId = `run_${Date.now()}`;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    this.logger.log(`Starting stateful agent run ${runId} for user ${user.userId}`);

    // Step 1: Collect Context & Memories
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

    // Step 2: Plan Generation with Model Gateway Failover
    const availableTools = this.registry.getAllTools().map((t) => t.tool.name);
    const plan = await this.modelGateway.generateStructuredPlan(
      dto.prompt,
      contextSummary,
      availableTools,
    );

    // Step 3: Record Agent Run & Persist All Steps (for crash resumption)
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
          currentStepIndex: 0,
          steps: {
            create: plan.steps.map((s) => ({
              stepNumber: s.stepNumber,
              name: s.title,
              status: 'PENDING',
              inputPayload: {
                description: s.description,
                estimatedMinutes: s.estimatedMinutes,
                targetToolName: s.targetToolName,
                toolInput: s.toolInput,
                riskLevel: s.riskLevel,
              } as unknown as Prisma.InputJsonValue,
            })),
          },
        },
      });
    }

    // Step 4: Step-by-step execution starting from step 1
    const execResult = await this.executeStepSequence(runId, user);

    return {
      id: runId,
      workspaceId: user.workspaceId,
      status: execResult.status,
      model,
      prompt: dto.prompt,
      planSummary: plan.intent,
      startedAt: new Date().toISOString(),
      finishedAt: execResult.status === 'SUCCEEDED' ? new Date().toISOString() : null,
      toolCallsCount: execResult.toolCallsCount,
      pendingApprovalsCount: execResult.pendingApprovals,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Resumes an interrupted or paused run from the exact step that was not yet completed.
   * Completed steps are never re-executed.
   */
  async resumeRun(runId: string, user: AuthenticatedUserContext): Promise<AgentRunResponseDto> {
    this.logger.log(`Resuming agent run ${runId} from step checkpoint...`);

    if (!this.prisma.isConnected) {
      return {
        id: runId,
        workspaceId: user.workspaceId,
        status: 'SUCCEEDED',
        model: 'gemini-2.5-flash',
        prompt: 'Resumed simulated run',
        planSummary: 'Simulated resumption',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        toolCallsCount: 0,
        pendingApprovalsCount: 0,
        createdAt: new Date().toISOString(),
      };
    }

    const run = await this.prisma.agentRun.findFirst({
      where: { id: runId, workspaceId: user.workspaceId },
      include: { steps: { orderBy: { stepNumber: 'asc' } } },
    });

    if (!run) {
      throw new NotFoundException(`Agent run ${runId} not found`);
    }

    await this.prisma.agentRun.update({
      where: { id: runId },
      data: { status: 'RUNNING', resumedFromStepId: run.id },
    });

    const execResult = await this.executeStepSequence(runId, user);

    return {
      id: runId,
      workspaceId: user.workspaceId,
      status: execResult.status,
      model: run.model,
      prompt: run.prompt,
      planSummary: run.planSummary || 'Resumed plan',
      startedAt: run.startedAt?.toISOString() || new Date().toISOString(),
      finishedAt: execResult.status === 'SUCCEEDED' ? new Date().toISOString() : null,
      toolCallsCount: execResult.toolCallsCount,
      pendingApprovalsCount: execResult.pendingApprovals,
      createdAt: run.createdAt.toISOString(),
    };
  }

  /**
   * Executes remaining steps sequentially, persisting state snapshots after each step
   */
  private async executeStepSequence(
    runId: string,
    user: AuthenticatedUserContext,
  ): Promise<{ status: 'RUNNING' | 'WAITING_FOR_APPROVAL' | 'SUCCEEDED' | 'FAILED'; pendingApprovals: number; toolCallsCount: number }> {
    if (!this.prisma.isConnected) {
      return { status: 'SUCCEEDED', pendingApprovals: 0, toolCallsCount: 1 };
    }

    const run = await this.prisma.agentRun.findUnique({
      where: { id: runId },
      include: { steps: { orderBy: { stepNumber: 'asc' } } },
    });

    if (!run) {
      return { status: 'FAILED', pendingApprovals: 0, toolCallsCount: 0 };
    }

    let pendingApprovals = 0;
    let toolCallsCount = 0;

    for (const step of run.steps) {
      // Skip steps that are already completed
      if (step.status === 'COMPLETED') {
        continue;
      }

      // Mark current step as RUNNING with timestamp
      const startTime = Date.now();
      await this.prisma.agentStep.update({
        where: { id: step.id },
        data: {
          status: 'RUNNING',
          startedAt: new Date(),
        },
      });

      await this.prisma.agentRun.update({
        where: { id: runId },
        data: { currentStepIndex: step.stepNumber },
      });

      const payload = step.inputPayload as any;

      if (payload?.targetToolName) {
        toolCallsCount++;
        const execContext = {
          userId: user.userId,
          workspaceId: user.workspaceId,
          allowedScopes: ['*'],
          traceId: `tr_${runId}_s${step.stepNumber}`,
        };

        const result = await this.executor.executeTool(
          runId,
          payload.targetToolName,
          payload.toolInput || {},
          execContext,
        );

        const durationMs = Date.now() - startTime;

        if (result.errorCode === 'REQUIRES_APPROVAL') {
          pendingApprovals++;
          await this.prisma.agentStep.update({
            where: { id: step.id },
            data: {
              status: 'PENDING',
              durationMs,
              stateSnapshot: { result, reason: 'WAITING_FOR_APPROVAL' } as unknown as Prisma.InputJsonValue,
            },
          });

          await this.prisma.agentRun.update({
            where: { id: runId },
            data: { status: 'WAITING_FOR_APPROVAL' },
          });

          return { status: 'WAITING_FOR_APPROVAL', pendingApprovals, toolCallsCount };
        }

        if (!result.success) {
          await this.prisma.agentStep.update({
            where: { id: step.id },
            data: {
              status: 'FAILED',
              error: result.errorMessage || result.summary || 'Execution failed',
              durationMs,
              finishedAt: new Date(),
            },
          });

          await this.prisma.agentRun.update({
            where: { id: runId },
            data: { status: 'FAILED', finishedAt: new Date() },
          });

          return { status: 'FAILED', pendingApprovals, toolCallsCount };
        }

        // Successfully completed tool step
        await this.prisma.agentStep.update({
          where: { id: step.id },
          data: {
            status: 'COMPLETED',
            outputPayload: result.data as any,
            durationMs,
            finishedAt: new Date(),
          },
        });
      } else {
        // Internal task step (synthesizing, planning, or reasoning)
        const durationMs = Date.now() - startTime;
        await this.prisma.agentStep.update({
          where: { id: step.id },
          data: {
            status: 'COMPLETED',
            outputPayload: { note: 'Completed internal step' },
            durationMs,
            finishedAt: new Date(),
          },
        });
      }
    }

    // All steps completed: add to Daily Review Digest instead of constant pings
    await this.prisma.dailyReviewDigestItem.create({
      data: {
        workspaceId: user.workspaceId,
        userId: user.userId,
        agentRunId: runId,
        title: `Plan Execution: ${run.prompt.slice(0, 50)}`,
        summary: `All ${run.steps.length} steps executed deterministically. Ready for batch daily review.`,
        category: 'agent_result',
        status: 'PENDING_REVIEW',
      },
    });

    await this.prisma.agentRun.update({
      where: { id: runId },
      data: { status: 'SUCCEEDED', finishedAt: new Date() },
    });

    return { status: 'SUCCEEDED', pendingApprovals: 0, toolCallsCount };
  }

  async getRunById(id: string, user: AuthenticatedUserContext) {
    if (this.prisma.isConnected) {
      return this.prisma.agentRun.findFirst({
        where: { id, workspaceId: user.workspaceId },
        include: {
          steps: { orderBy: { stepNumber: 'asc' } },
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
      steps: [],
    };
  }
}
