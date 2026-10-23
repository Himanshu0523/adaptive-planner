import { RiskLevel } from '@adaptive-planner/contracts';

export { RiskLevel };

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>; // JSON Schema object
  requiredScopes: string[];
  riskLevel: RiskLevel;
  timeoutMs: number;
}

export interface AuthorizedExecutionContext {
  userId: string;
  workspaceId: string;
  connectionId?: string;
  allowedScopes: string[];
  traceId: string;
}

export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  summary: string;
  errorCode?: string;
  errorMessage?: string;
  providerRequestId?: string;
}

export type ConnectionHealthStatus =
  | 'CONNECTED'
  | 'EXPIRED'
  | 'REVOKED'
  | 'RATE_LIMITED'
  | 'TEMPORARILY_UNAVAILABLE'
  | 'ERROR';

export interface ConnectionHealth {
  status: ConnectionHealthStatus;
  message?: string;
  lastCheckedAt: string;
}

export interface IntegrationAdapter {
  readonly providerId: string;
  readonly displayName: string;
  readonly description: string;
  listTools(): ToolDefinition[];
  execute(
    toolName: string,
    input: unknown,
    context: AuthorizedExecutionContext,
  ): Promise<ToolResult>;
  checkConnection(
    context: AuthorizedExecutionContext,
  ): Promise<ConnectionHealth>;
}
