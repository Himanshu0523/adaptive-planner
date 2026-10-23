export interface ModelGatewayMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StructuredPlanOutput {
  intent: string;
  assumptions: string[];
  tradeOffs: string[];
  steps: Array<{
    stepNumber: number;
    title: string;
    description: string;
    estimatedMinutes: number;
    targetToolName?: string;
    toolInput?: Record<string, unknown>;
    riskLevel: 'READ_ONLY' | 'LOW_RISK_INTERNAL_WRITE' | 'EXTERNAL_WRITE' | 'SENSITIVE_ACTION' | 'HIGH_IMPACT_ACTION';
  }>;
}

export interface ModelGatewayResponse {
  text: string;
  structuredPlan?: StructuredPlanOutput;
  tokensUsed?: number;
  model: string;
}

export interface IModelGateway {
  readonly providerName: string;
  generateText(prompt: string, systemPrompt?: string): Promise<ModelGatewayResponse>;
  generateStructuredPlan(
    goalIntent: string,
    contextSummary: string,
    availableTools: string[],
  ): Promise<StructuredPlanOutput>;
}
