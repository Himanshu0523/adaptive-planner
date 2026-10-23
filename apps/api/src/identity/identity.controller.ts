import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUserContext } from '@adaptive-planner/contracts';
import { IdentityService } from './identity.service';

@ApiTags('Identity')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('me')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Get()
  @ApiOperation({ summary: 'Get current authenticated user profile and workspaces' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getMe(@CurrentUser() user: AuthenticatedUserContext) {
    const profile = await this.identityService.getCurrentUser(user);
    return {
      success: true,
      data: profile,
      timestamp: new Date().toISOString(),
    };
  }
}
