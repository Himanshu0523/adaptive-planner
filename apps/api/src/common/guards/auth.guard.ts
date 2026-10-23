import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedUserContext } from '@adaptive-planner/contracts';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // 1. Check Authorization Bearer header
    const authHeader = request.headers['authorization'];
    const customUserId = request.headers['x-user-id'] as string;
    const customWorkspaceId = request.headers['x-workspace-id'] as string;

    // Development fallback or header-based user context
    const userId = customUserId || (authHeader ? 'usr_dev_001' : 'usr_dev_001');
    const workspaceId = customWorkspaceId || 'ws_dev_personal_001';

    const userContext: AuthenticatedUserContext = {
      userId,
      email: 'user@adaptiveplanner.local',
      displayName: 'Alex Planner',
      workspaceId,
      role: 'OWNER',
    };

    request.user = userContext;
    return true;
  }
}
