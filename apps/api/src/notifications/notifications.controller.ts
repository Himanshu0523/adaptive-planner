import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUserContext } from '@adaptive-planner/contracts';
import { NotificationsService, NotificationPreferencesDto } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('preferences')
  @ApiOperation({ summary: 'Read notification and focus reminder preferences' })
  @ApiResponse({ status: 200, description: 'Preferences returned' })
  async getPreferences(@CurrentUser() user: AuthenticatedUserContext) {
    const prefs = await this.notificationsService.getPreferences(user);
    return {
      success: true,
      data: prefs,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated' })
  async updatePreferences(
    @Body() dto: Partial<NotificationPreferencesDto>,
    @CurrentUser() user: AuthenticatedUserContext,
  ) {
    const prefs = await this.notificationsService.updatePreferences(dto, user);
    return {
      success: true,
      data: prefs,
      timestamp: new Date().toISOString(),
    };
  }
}
