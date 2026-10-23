import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { GeminiGatewayService } from '../agent/model-gateway/gemini-gateway.service';
import { ToolRegistryService } from '../tools/registry/tool-registry.service';
import {
  AuthenticatedUserContext,
  GeneratePlanRequestDto,
  ApprovePlanRequestDto,
  ProposedPlanDto,
} from '@adaptive-planner/contracts';

@Injectable()
export class PlanningService {
  private readonly plans = new Map<string, ProposedPlanDto>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiGatewayService,
    private readonly registry: ToolRegistryService,
  ) {}

  async generateProposedPlan(
    dto: GeneratePlanRequestDto,
    user: AuthenticatedUserContext,
  ): Promise<ProposedPlanDto> {
    const planId = `plan_${Date.now()}`;
    const availableTools = this.registry.getAllTools().map((t) => t.tool.name);

    let context = `Workspace: ${user.workspaceId}, Intent: ${dto.naturalLanguageIntent}`;
    if (dto.availableHoursPerDay) {
      context += `, Daily capacity: ${dto.availableHoursPerDay}h`;
    }
    if (dto.preferredTimeOfDay) {
      context += `, Preference: ${dto.preferredTimeOfDay}`;
    }

    const structured = await this.gemini.generateStructuredPlan(
      dto.naturalLanguageIntent,
      context,
      availableTools,
    );

    const proposedPlan: ProposedPlanDto = {
      planId,
      goalId: dto.goalId,
      intent: structured.intent,
      assumptions: structured.assumptions,
      tradeOffs: structured.tradeOffs,
      totalEstimatedMinutes: structured.steps.reduce(
        (sum, s) => sum + s.estimatedMinutes,
        0,
      ),
      steps: structured.steps.map((s, idx) => ({
        stepNumber: s.stepNumber || idx + 1,
        title: s.title,
        description: s.description,
        estimatedMinutes: s.estimatedMinutes || 30,
        suggestedDayOffset: idx,
        targetToolName: s.targetToolName,
        toolInput: s.toolInput,
        riskLevel: s.riskLevel || 'LOW_RISK_INTERNAL_WRITE',
      })),
      requiresApprovalCount: structured.steps.filter(
        (s) => s.riskLevel === 'EXTERNAL_WRITE' || s.riskLevel === 'SENSITIVE_ACTION',
      ).length,
      generatedAt: new Date().toISOString(),
    };

    this.plans.set(planId, proposedPlan);
    return proposedPlan;
  }

  async approvePlan(
    planId: string,
    dto: ApprovePlanRequestDto,
    user: AuthenticatedUserContext,
  ) {
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new NotFoundException(`Plan ${planId} not found or expired`);
    }

    // Materialize into database: create goal (if not set) and tasks
    if (this.prisma.isConnected) {
      let targetGoalId = plan.goalId;

      if (!targetGoalId) {
        const goal = await this.prisma.goal.create({
          data: {
            workspaceId: user.workspaceId,
            title: plan.intent.slice(0, 80),
            description: `Auto-generated from approved plan (${planId})`,
            status: 'ACTIVE',
            versions: {
              create: {
                version: 1,
                definitionJson: plan as any,
                approvedAt: new Date(),
              },
            },
          },
        });
        targetGoalId = goal.id;
      }

      // Materialize steps into actionable tasks
      const createdTasks = [];
      for (const step of plan.steps) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + step.suggestedDayOffset);

        const task = await this.prisma.task.create({
          data: {
            workspaceId: user.workspaceId,
            goalId: targetGoalId,
            title: step.title,
            notes: step.description,
            estimatedMinutes: step.estimatedMinutes,
            dueAt: dueDate,
            status: 'TODO',
          },
        });
        createdTasks.push(task);
      }

      return {
        planId,
        goalId: targetGoalId,
        materializedTasksCount: createdTasks.length,
        status: 'MATERIALIZED',
      };
    }

    return {
      planId,
      goalId: plan.goalId || `goal_${Date.now()}`,
      materializedTasksCount: plan.steps.length,
      status: 'MATERIALIZED',
    };
  }
}
