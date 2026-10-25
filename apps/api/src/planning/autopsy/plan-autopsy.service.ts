import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GeminiGatewayService } from '../../agent/model-gateway/gemini-gateway.service';

export type AutopsyCause =
  | 'ESTIMATE_MISS'
  | 'CAPACITY_CLASH'
  | 'BLOCKER'
  | 'AVOIDANCE'
  | 'CHANGED_ASSUMPTION'
  | 'AGENT_FAILURE';

export interface TaskSlipMetrics {
  taskId?: string;
  taskTitle: string;
  goalId?: string;
  goalTitle?: string;
  estimatedMinutes: number;
  actualMinutesLogged: number;
  rescheduleCount: number;
  hasBlocker: boolean;
  unresolvedDependenciesCount: number;
  dailyScheduledMinutes: number;
  maxDailyCapacityMinutes?: number;
  isScopeChanged: boolean;
  hasAgentFailure: boolean;
}

export interface AutopsyResult {
  primaryCause: AutopsyCause;
  causeLabel: string;
  confidence: number;
  evidencePacket: Record<string, any>;
  explanation: string;
  rankedRecoveryOptions: Array<{
    optionId: string;
    optionTitle: string;
    recommendedRank: number;
    rationale: string;
  }>;
}

@Injectable()
export class PlanAutopsyService {
  private readonly logger = new Logger(PlanAutopsyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly modelGateway: GeminiGatewayService,
  ) {}

  /**
   * Deterministically classifies the cause of a schedule slip without needing an LLM.
   * Rules rank causes, and the LLM only writes the non-judgmental explanation.
   */
  async performAutopsy(metrics: TaskSlipMetrics, workspaceId: string): Promise<AutopsyResult> {
    const maxCapacity = metrics.maxDailyCapacityMinutes || 240; // 4 hours focus default

    let cause: AutopsyCause;
    let confidence: number;
    let causeLabel: string;
    const evidence: Record<string, any> = {
      taskTitle: metrics.taskTitle,
      estimatedMinutes: metrics.estimatedMinutes,
      actualMinutesLogged: metrics.actualMinutesLogged,
      rescheduleCount: metrics.rescheduleCount,
      hasBlocker: metrics.hasBlocker,
      dailyScheduledMinutes: metrics.dailyScheduledMinutes,
      dailyCapacityThreshold: maxCapacity,
    };

    // 1. Agent Failure Check
    if (metrics.hasAgentFailure) {
      cause = 'AGENT_FAILURE';
      causeLabel = 'Agent Execution Bottleneck';
      confidence = 0.95;
      evidence.reason = 'Autonomous agent step encountered tool exception or permission denial.';
    }
    // 2. Blocker / Prerequisite Check
    else if (metrics.hasBlocker || metrics.unresolvedDependenciesCount > 0) {
      cause = 'BLOCKER';
      causeLabel = 'External Dependency or Blocker';
      confidence = 0.92;
      evidence.reason = `${metrics.unresolvedDependenciesCount} unresolved prerequisite(s) delayed initiation.`;
    }
    // 3. Estimate Miss Check (> 1.4x overrun)
    else if (metrics.actualMinutesLogged > 1.4 * metrics.estimatedMinutes && metrics.estimatedMinutes > 0) {
      cause = 'ESTIMATE_MISS';
      causeLabel = 'Underestimated Task Complexity';
      confidence = 0.88;
      const overrunPct = Math.round(((metrics.actualMinutesLogged - metrics.estimatedMinutes) / metrics.estimatedMinutes) * 100);
      evidence.overrunPercentage = `${overrunPct}%`;
      evidence.reason = `Task required ${metrics.actualMinutesLogged}m vs estimated ${metrics.estimatedMinutes}m.`;
    }
    // 4. Capacity Clash Check (> daily focus ceiling)
    else if (metrics.dailyScheduledMinutes > maxCapacity) {
      cause = 'CAPACITY_CLASH';
      causeLabel = 'Daily Cognitive Capacity Saturated';
      confidence = 0.85;
      evidence.reason = `Scheduled ${metrics.dailyScheduledMinutes}m of work against a healthy ${maxCapacity}m ceiling.`;
    }
    // 5. Avoidance Check (repeated rescheduling / abandonment)
    else if (metrics.rescheduleCount >= 3) {
      cause = 'AVOIDANCE';
      causeLabel = 'Friction / Starting Hesitation';
      confidence = 0.82;
      evidence.reason = `Task rescheduled ${metrics.rescheduleCount} times without significant timer progress.`;
    }
    // 6. Changed Assumption Check
    else if (metrics.isScopeChanged) {
      cause = 'CHANGED_ASSUMPTION';
      causeLabel = 'Scope & Requirement Evolution';
      confidence = 0.80;
      evidence.reason = 'Milestone acceptance criteria or deliverable definition evolved during execution.';
    }
    // Fallback: Estimate Miss
    else {
      cause = 'ESTIMATE_MISS';
      causeLabel = 'Natural Schedule Drift';
      confidence = 0.70;
      evidence.reason = 'Natural friction and context-switching overhead accumulated across the day.';
    }

    // Rank Recovery Options based on the deterministic cause
    const rankedOptions = this.rankRecoveryOptionsByCause(cause);

    // LLM synthesis: write calm, compassionate, non-judgmental explanation
    const explanation = await this.synthesizeExplanation(cause, evidence);

    // Persist to Prisma if database is connected
    if (this.prisma.isConnected) {
      await this.prisma.planAutopsy.create({
        data: {
          workspaceId,
          goalId: metrics.goalId || null,
          taskId: metrics.taskId || null,
          primaryCause: cause,
          evidencePacket: evidence,
          explanation,
          rankedRecoveryJson: rankedOptions,
        },
      });
    }

    return {
      primaryCause: cause,
      causeLabel,
      confidence,
      evidencePacket: evidence,
      explanation,
      rankedRecoveryOptions: rankedOptions,
    };
  }

  private rankRecoveryOptionsByCause(cause: AutopsyCause) {
    switch (cause) {
      case 'ESTIMATE_MISS':
        return [
          {
            optionId: 'extend_deadline',
            optionTitle: 'Option 2 — Extend the Deadline Gently',
            recommendedRank: 1,
            rationale: 'Absorbs the true verified duration without cutting quality or rushing.',
          },
          {
            optionId: 'keep_deadline',
            optionTitle: 'Option 1 — Keep the Target Deadline',
            recommendedRank: 2,
            rationale: 'Prunes non-critical secondary scope to protect the delivery milestone.',
          },
          {
            optionId: 'reallocate_time',
            optionTitle: 'Option 3 — Reallocate Available Time',
            recommendedRank: 3,
            rationale: 'Draws from upcoming buffer intervals to retain all deliverables.',
          },
        ];

      case 'CAPACITY_CLASH':
        return [
          {
            optionId: 'reallocate_time',
            optionTitle: 'Option 3 — Reallocate Available Time',
            recommendedRank: 1,
            rationale: 'Spreads congested work across open afternoon buffers to prevent cognitive strain.',
          },
          {
            optionId: 'extend_deadline',
            optionTitle: 'Option 2 — Extend the Deadline Gently',
            recommendedRank: 2,
            rationale: 'Adds 2–3 calendar days to keep daily sessions under 45 minutes.',
          },
          {
            optionId: 'keep_deadline',
            optionTitle: 'Option 1 — Keep the Target Deadline',
            recommendedRank: 3,
            rationale: 'Defers secondary items so primary deliverables finish within capacity.',
          },
        ];

      case 'BLOCKER':
        return [
          {
            optionId: 'extend_deadline',
            optionTitle: 'Option 2 — Extend the Deadline Gently',
            recommendedRank: 1,
            rationale: 'Pauses active clock while external party unblocks the prerequisite.',
          },
          {
            optionId: 'keep_deadline',
            optionTitle: 'Option 1 — Keep the Target Deadline',
            recommendedRank: 2,
            rationale: 'Swaps in unblocked parallel work packages to maintain momentum.',
          },
          {
            optionId: 'reallocate_time',
            optionTitle: 'Option 3 — Reallocate Available Time',
            recommendedRank: 3,
            rationale: 'Shifts blocked work to later in the week once dependency resolves.',
          },
        ];

      case 'AVOIDANCE':
        return [
          {
            optionId: 'keep_deadline',
            optionTitle: 'Option 1 — Keep the Target Deadline',
            recommendedRank: 1,
            rationale: 'Deconstructs the intimidating task into a frictionless 10-minute starter chunk.',
          },
          {
            optionId: 'reallocate_time',
            optionTitle: 'Option 3 — Reallocate Available Time',
            recommendedRank: 2,
            rationale: 'Moves the task to your peak morning focus window when energy is highest.',
          },
          {
            optionId: 'extend_deadline',
            optionTitle: 'Option 2 — Extend the Deadline Gently',
            recommendedRank: 3,
            rationale: 'Gives breathing room before re-engaging with the task.',
          },
        ];

      case 'CHANGED_ASSUMPTION':
      case 'AGENT_FAILURE':
      default:
        return [
          {
            optionId: 'keep_deadline',
            optionTitle: 'Option 1 — Keep the Target Deadline',
            recommendedRank: 1,
            rationale: 'Locks in revised core acceptance criteria without slipping target dates.',
          },
          {
            optionId: 'extend_deadline',
            optionTitle: 'Option 2 — Extend the Deadline Gently',
            recommendedRank: 2,
            rationale: 'Accommodates the newly discovered scope additions calmly.',
          },
          {
            optionId: 'reallocate_time',
            optionTitle: 'Option 3 — Reallocate Available Time',
            recommendedRank: 3,
            rationale: 'Schedules buffer slots for revised specification review.',
          },
        ];
    }
  }

  private async synthesizeExplanation(cause: AutopsyCause, evidence: Record<string, any>): Promise<string> {
    const prompt = `
You are the compassionate Plan Autopsy diagnostic engine in Adaptive Planner.
Write a 2-sentence, supportive, guilt-free explanation for a schedule slip.
Cause: ${cause}
Evidence: ${JSON.stringify(evidence)}

Guidelines:
- Never use judgmental words like "failed", "procrastinated", "lazy", "late", or "guilty".
- Frame the observation as normal, expected adaptation to real-world complexity.
- Directly explain the operational friction (e.g. estimate delta, capacity limit, or dependency wait).
`;

    try {
      const response = await this.modelGateway.generateText(prompt);
      if (response?.text && !response.text.includes('Deterministic Narrative')) {
        return response.text.trim();
      }
    } catch (err) {
      this.logger.warn(`Model gateway narrative failed: ${err}`);
    }

    // High quality deterministic fallbacks conforming to Adaptive Planner guidelines
    switch (cause) {
      case 'ESTIMATE_MISS':
        return `This task took longer than initially planned due to natural discovery and depth during execution. That is standard in creative work; we will simply recalibrate your future buffers accordingly.`;
      case 'CAPACITY_CLASH':
        return `Today's schedule exceeded your healthy daily focus ceiling, making an overrun inevitable. Protecting cognitive stamina is the priority, so let's redistribute the remaining items comfortably.`;
      case 'BLOCKER':
        return `An external dependency or prerequisite held up this task before deep work could begin. Since you cannot control third-party timelines, we will hold the milestone safely until unblocked.`;
      case 'AVOIDANCE':
        return `This task has been rescheduled multiple times, which usually signals unclear next steps or cognitive resistance rather than lack of discipline. Breaking it into a 10-minute micro-action will restore momentum.`;
      case 'CHANGED_ASSUMPTION':
        return `The scope and requirements evolved naturally as you learned more about the problem. A plan must bend to reality rather than enforce obsolete assumptions.`;
      case 'AGENT_FAILURE':
        return `An automated agent step encountered an execution error and halted to preserve safety. You can review the step or complete it directly without penalty.`;
      default:
        return `Real-world interruptions shifted your planned hours today. Adaptive Planner is designed to recalibrate with zero guilt whenever life happens.`;
    }
  }
}
