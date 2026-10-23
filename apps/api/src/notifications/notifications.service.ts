import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuthenticatedUserContext } from '@adaptive-planner/contracts';

export interface NotificationPreferencesDto {
  emailNotifications: boolean;
  dailyFocusDigest: boolean;
  bufferAlerts: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPreferences(user: AuthenticatedUserContext): Promise<NotificationPreferencesDto> {
    return {
      emailNotifications: true,
      dailyFocusDigest: true,
      bufferAlerts: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
    };
  }

  async updatePreferences(
    dto: Partial<NotificationPreferencesDto>,
    user: AuthenticatedUserContext,
  ): Promise<NotificationPreferencesDto> {
    return {
      emailNotifications: dto.emailNotifications ?? true,
      dailyFocusDigest: dto.dailyFocusDigest ?? true,
      bufferAlerts: dto.bufferAlerts ?? true,
      quietHoursStart: dto.quietHoursStart ?? '22:00',
      quietHoursEnd: dto.quietHoursEnd ?? '07:00',
    };
  }
}
