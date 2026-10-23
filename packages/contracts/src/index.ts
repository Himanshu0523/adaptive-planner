// -------------------------------------------------------------
// Common & Identity Contracts
// -------------------------------------------------------------

export interface AuthenticatedUserContext {
  userId: string;
  email: string;
  displayName: string;
  workspaceId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
  traceId?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// -------------------------------------------------------------
// Goal Contracts
// -------------------------------------------------------------

export type GoalType = 'MILESTONE_DRIVEN' | 'HABITUAL' | 'TIME_BOUND' | 'OPEN_ENDED';
export type GoalStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface CreateGoalDto {
  title: string;
  description?: string;
  goalType?: GoalType;
  targetDate?: string;
  priority?: PriorityLevel;
  milestones?: Array<{
    title: string;
    description?: string;
    dueAt?: string;
    orderIndex?: number;
  }>;
}

export interface UpdateGoalDto {
  title?: string;
  description?: string;
  status?: GoalStatus;
  targetDate?: string;
  priority?: PriorityLevel;
}

export interface GoalResponseDto {
  id: string;
  workspaceId: string;
  title: string;
  description?: string | null;
  goalType: GoalType;
  status: GoalStatus;
  targetDate?: string | null;
  priority: PriorityLevel;
  createdAt: string;
  updatedAt: string;
  milestones?: MilestoneResponseDto[];
  tasksCount?: number;
}

export interface MilestoneResponseDto {
  id: string;
  goalId: string;
  title: string;
  description?: string | null;
  dueAt?: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  orderIndex: number;
}

// -------------------------------------------------------------
// Task Contracts
// -------------------------------------------------------------

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED' | 'BLOCKED';

export interface CreateTaskDto {
  title: string;
  notes?: string;
  goalId?: string;
  milestoneId?: string;
  estimatedMinutes?: number;
  dueAt?: string;
  priority?: PriorityLevel;
  dependsOnTaskIds?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  notes?: string;
  status?: TaskStatus;
  estimatedMinutes?: number;
  dueAt?: string | null;
  priority?: PriorityLevel;
  completedAt?: string | null;
}

export interface TaskResponseDto {
  id: string;
  workspaceId: string;
  goalId?: string | null;
  milestoneId?: string | null;
  title: string;
  notes?: string | null;
  status: TaskStatus;
  estimatedMinutes: number;
  dueAt?: string | null;
  completedAt?: string | null;
  priority: PriorityLevel;
  createdAt: string;
  updatedAt: string;
  dependencyIds?: string[];
}

// -------------------------------------------------------------
// Planning & Agent Contracts
// -------------------------------------------------------------

export interface GeneratePlanRequestDto {
  goalId?: string;
  naturalLanguageIntent: string;
  availableHoursPerDay?: number;
  targetCompletionDate?: string;
  preferredTimeOfDay?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FLEXIBLE';
}

export interface ProposedPlanStep {
  stepNumber: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  suggestedDayOffset: number;
  targetToolName?: string;
  toolInput?: Record<string, unknown>;
  riskLevel: 'READ_ONLY' | 'LOW_RISK_INTERNAL_WRITE' | 'EXTERNAL_WRITE' | 'SENSITIVE_ACTION' | 'HIGH_IMPACT_ACTION';
}

export interface ProposedPlanDto {
  planId: string;
  goalId?: string;
  intent: string;
  assumptions: string[];
  tradeOffs: string[];
  totalEstimatedMinutes: number;
  steps: ProposedPlanStep[];
  requiresApprovalCount: number;
  generatedAt: string;
}

export interface ApprovePlanRequestDto {
  approvedStepIndices?: number[];
  modifications?: Array<{
    stepNumber: number;
    title?: string;
    estimatedMinutes?: number;
  }>;
}

// -------------------------------------------------------------
// Agent Run Contracts
// -------------------------------------------------------------

export type AgentRunStatus = 'QUEUED' | 'RUNNING' | 'WAITING_FOR_APPROVAL' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';

export interface StartAgentRunDto {
  prompt: string;
  goalId?: string;
  allowedTools?: string[];
}

export interface AgentRunResponseDto {
  id: string;
  workspaceId: string;
  status: AgentRunStatus;
  model: string;
  prompt: string;
  planSummary?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  toolCallsCount: number;
  pendingApprovalsCount: number;
  createdAt: string;
}

// -------------------------------------------------------------
// Action Approvals & Risk Policies
// -------------------------------------------------------------

export type RiskLevel = 'READ_ONLY' | 'LOW_RISK_INTERNAL_WRITE' | 'EXTERNAL_WRITE' | 'SENSITIVE_ACTION' | 'HIGH_IMPACT_ACTION';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface ActionApprovalDto {
  id: string;
  toolCallId: string;
  workspaceId: string;
  actionSummary: string;
  toolName: string;
  riskLevel: RiskLevel;
  inputPayload: unknown;
  status: ApprovalStatus;
  expiresAt: string;
  createdAt: string;
}

export interface ApprovalDecisionDto {
  decision: 'APPROVE' | 'REJECT';
  reason?: string;
}

// -------------------------------------------------------------
// Integrations Contracts
// -------------------------------------------------------------

export interface IntegrationCatalogItem {
  providerId: string;
  name: string;
  description: string;
  category: 'calendar' | 'developer' | 'communication' | 'mcp';
  availableScopes: string[];
  supportedTools: string[];
}

export interface IntegrationConnectionDto {
  id: string;
  provider: string;
  providerAccountId: string;
  status: 'CONNECTED' | 'EXPIRED' | 'REVOKED' | 'ERROR';
  scopes: string[];
  lastSyncedAt?: string | null;
  createdAt: string;
}
