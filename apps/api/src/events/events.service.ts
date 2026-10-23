import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async handleInboundWebhook(
    provider: string,
    payload: unknown,
    headers: Record<string, string>,
  ) {
    const eventId =
      headers['x-event-id'] ||
      headers['x-github-delivery'] ||
      `evt_${provider}_${Date.now()}`;

    this.logger.log(`Received webhook from ${provider} with event ID: ${eventId}`);

    // Idempotent deduplication check
    if (this.prisma.isConnected) {
      const existing = await this.prisma.integrationEvent.findFirst({
        where: { providerEventId: eventId },
      });

      if (existing) {
        this.logger.warn(`Duplicate event received and dropped: ${eventId}`);
        return { status: 'already_processed', eventId };
      }
    }

    return {
      status: 'queued_for_processing',
      provider,
      eventId,
      receivedAt: new Date().toISOString(),
    };
  }
}
