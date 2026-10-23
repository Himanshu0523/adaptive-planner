import {
  IntegrationAdapter,
  ToolDefinition,
  AuthorizedExecutionContext,
  ToolResult,
  ConnectionHealth,
} from '@adaptive-planner/tool-sdk';

export class MCPAdapter implements IntegrationAdapter {
  readonly providerId = 'mcp';
  readonly displayName = 'Model Context Protocol (MCP)';
  readonly description = 'Bridge to standardize tool invocation across local or remote MCP servers';

  private registeredTools: ToolDefinition[] = [
    {
      name: 'mcp_search_knowledge',
      description: 'Query standardized MCP resource servers for workspace knowledge',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' },
        },
        required: ['query'],
      },
      requiredScopes: ['mcp:read'],
      riskLevel: 'READ_ONLY',
      timeoutMs: 5000,
    },
  ];

  listTools(): ToolDefinition[] {
    return this.registeredTools;
  }

  async execute(
    toolName: string,
    input: unknown,
    context: AuthorizedExecutionContext,
  ): Promise<ToolResult> {
    if (toolName === 'mcp_search_knowledge') {
      const payload = input as { query: string };
      return {
        success: true,
        summary: `MCP knowledge query executed for: "${payload.query}"`,
        data: {
          results: [
            {
              uri: 'mcp://personal-agent/knowledge/planning-heuristics',
              content: 'Adaptive Planner heuristic: 15% focus compression buffer recommended.',
            },
          ],
        },
      };
    }

    return {
      success: false,
      summary: `Unknown MCP tool: ${toolName}`,
      errorCode: 'TOOL_NOT_FOUND',
    };
  }

  async checkConnection(context: AuthorizedExecutionContext): Promise<ConnectionHealth> {
    return {
      status: 'CONNECTED',
      message: 'MCP client daemon ready',
      lastCheckedAt: new Date().toISOString(),
    };
  }
}
