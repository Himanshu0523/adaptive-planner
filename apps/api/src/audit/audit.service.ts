import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logAction(
    workspaceId: string,
    actorId: string,
    action: string,
    targetType: string,
    targetId: string,
    metadata?: Record<string, unknown>,
  ) {
    if (this.prisma.isConnected) {
      try {
        await this.prisma.auditEvent.create({
          data: {
            workspaceId,
            actorId,
            actorType: 'USER',
            action,
            targetType,
            targetId,
            metadata: metadata as any,
          },
        });
      } catch (err) {
        this.logger.error(`Failed to record audit event: ${err}`);
      }
    }
  }
}
