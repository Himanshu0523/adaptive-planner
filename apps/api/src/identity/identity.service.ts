import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuthenticatedUserContext } from '@adaptive-planner/contracts';

@Injectable()
export class IdentityService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentUser(userContext: AuthenticatedUserContext) {
    if (this.prisma.isConnected) {
      const user = await this.prisma.user.findUnique({
        where: { id: userContext.userId },
        include: {
          ownedWorkspaces: true,
          workspaceMembers: {
            include: { workspace: true },
          },
        },
      });

      if (user) {
        return {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          timezone: user.timezone,
          activeWorkspaceId: userContext.workspaceId,
          workspaces: user.workspaceMembers.map((m) => ({
            id: m.workspace.id,
            name: m.workspace.name,
            role: m.role,
          })),
        };
      }
    }

    // Resilient fallback for dev boot before initial migration
    return {
      id: userContext.userId,
      email: userContext.email,
      displayName: userContext.displayName,
      timezone: 'UTC',
      activeWorkspaceId: userContext.workspaceId,
      workspaces: [
        {
          id: userContext.workspaceId,
          name: "Alex's Personal Workspace",
          role: userContext.role,
        },
      ],
    };
  }
}
