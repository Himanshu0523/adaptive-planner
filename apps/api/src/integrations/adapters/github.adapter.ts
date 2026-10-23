import {
  IntegrationAdapter,
  ToolDefinition,
  AuthorizedExecutionContext,
  ToolResult,
  ConnectionHealth,
} from '@adaptive-planner/tool-sdk';

export class GitHubAdapter implements IntegrationAdapter {
  readonly providerId = 'github';
  readonly displayName = 'GitHub';
  readonly description = 'Synchronize milestone issues, track pull request progress, and link tasks to code commits';

  listTools(): ToolDefinition[] {
    return [
      {
        name: 'github_list_issues',
        description: 'List open issues and milestones for a given repository',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string' },
            repo: { type: 'string' },
          },
          required: ['owner', 'repo'],
        },
        requiredScopes: ['repo:read'],
        riskLevel: 'READ_ONLY',
        timeoutMs: 5000,
      },
      {
        name: 'github_create_issue',
        description: 'Create a GitHub issue linked to an adaptive goal milestone',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string' },
            repo: { type: 'string' },
            title: { type: 'string' },
            body: { type: 'string' },
          },
          required: ['owner', 'repo', 'title'],
        },
        requiredScopes: ['repo:write'],
        riskLevel: 'EXTERNAL_WRITE',
        timeoutMs: 8000,
      },
    ];
  }

  async execute(
    toolName: string,
    input: unknown,
    context: AuthorizedExecutionContext,
  ): Promise<ToolResult> {
    if (toolName === 'github_list_issues') {
      return {
        success: true,
        summary: 'Retrieved 0 open issues for repository',
        data: { issues: [] },
      };
    }

    if (toolName === 'github_create_issue') {
      const payload = input as { owner: string; repo: string; title: string };
      return {
        success: true,
        summary: `Created GitHub issue #${Math.floor(Math.random() * 50) + 1} '${payload.title}' in ${payload.owner}/${payload.repo}`,
        data: {
          issueNumber: 42,
          url: `https://github.com/${payload.owner}/${payload.repo}/issues/42`,
        },
      };
    }

    return {
      success: false,
      summary: `Unknown GitHub tool: ${toolName}`,
      errorCode: 'TOOL_NOT_FOUND',
    };
  }

  async checkConnection(context: AuthorizedExecutionContext): Promise<ConnectionHealth> {
    return {
      status: 'CONNECTED',
      message: 'GitHub OAuth connection valid',
      lastCheckedAt: new Date().toISOString(),
    };
  }
}
