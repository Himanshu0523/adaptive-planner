import {
  Injectable,
  OnModuleInit,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ToolRegistryService } from '../tools/registry/tool-registry.service';
import { GoogleCalendarAdapter } from './adapters/google-calendar.adapter';
import { GitHubAdapter } from './adapters/github.adapter';
import { MCPAdapter } from './adapters/mcp.adapter';
import {
  AuthenticatedUserContext,
  IntegrationCatalogItem,
} from '@adaptive-planner/contracts';

@Injectable()
export class IntegrationsService implements OnModuleInit {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly toolRegistry: ToolRegistryService,
  ) {}

  onModuleInit() {
    // Register standard adapters into tool registry
    this.toolRegistry.registerAdapter(new GoogleCalendarAdapter());
    this.toolRegistry.registerAdapter(new GitHubAdapter());
    this.toolRegistry.registerAdapter(new MCPAdapter());
    this.logger.log('Standard integration adapters registered into ToolRegistryService');
  }

  getCatalog(): IntegrationCatalogItem[] {
    return [
      {
        providerId: 'google_calendar',
        name: 'Google Calendar',
        description: 'Read busy schedule slots and create intentional focus blocks.',
        category: 'calendar',
        availableScopes: [
          'https://www.googleapis.com/auth/calendar.events.readonly',
          'https://www.googleapis.com/auth/calendar.events',
        ],
        supportedTools: ['google_calendar_list_events', 'google_calendar_create_event'],
      },
      {
        providerId: 'github',
        name: 'GitHub',
        description: 'Sync milestones, issues, and code commits with your goals.',
        category: 'developer',
        availableScopes: ['repo:read', 'repo:write'],
        supportedTools: ['github_list_issues', 'github_create_issue'],
      },
      {
        providerId: 'mcp',
        name: 'Model Context Protocol (MCP)',
        description: 'Standardized local/remote tool bridging protocol.',
        category: 'mcp',
        availableScopes: ['mcp:read', 'mcp:write'],
        supportedTools: ['mcp_search_knowledge'],
      },
    ];
  }

  async beginConnect(
    providerId: string,
    user: AuthenticatedUserContext,
  ): Promise<{ authorizationUrl: string; state: string }> {
    const catalog = this.getCatalog();
    const provider = catalog.find((p) => p.providerId === providerId);
    if (!provider) {
      throw new NotFoundException(`Unsupported integration provider: ${providerId}`);
    }

    const state = `st_${user.workspaceId}_${Date.now()}`;
    const redirectUrl = `https://auth.adaptiveplanner.local/oauth/authorize?provider=${providerId}&state=${state}`;

    return {
      authorizationUrl: redirectUrl,
      state,
    };
  }

  async listConnections(user: AuthenticatedUserContext) {
    if (this.prisma.isConnected) {
      return this.prisma.integrationConnection.findMany({
        where: { workspaceId: user.workspaceId },
        include: {
          permissions: true,
        },
      });
    }

    return [
      {
        id: 'conn_gcal_sample',
        workspaceId: user.workspaceId,
        provider: 'google_calendar',
        providerAccountId: 'user@adaptiveplanner.local',
        status: 'CONNECTED',
        lastSyncedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        permissions: [
          {
            scope: 'https://www.googleapis.com/auth/calendar.events.readonly',
            status: 'GRANTED',
          },
        ],
      },
    ];
  }

  async disconnect(connectionId: string, user: AuthenticatedUserContext) {
    if (this.prisma.isConnected) {
      const conn = await this.prisma.integrationConnection.findFirst({
        where: { id: connectionId, workspaceId: user.workspaceId },
      });
      if (!conn) {
        throw new NotFoundException(`Connection ${connectionId} not found`);
      }

      await this.prisma.integrationConnection.delete({
        where: { id: connectionId },
      });

      return { disconnected: true, id: connectionId };
    }

    return { disconnected: true, id: connectionId };
  }
}
