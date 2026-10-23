import {
  Controller,
  Post,
  Param,
  Body,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventsService } from './events.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post(':provider')
  @ApiOperation({ summary: 'Receive asynchronous provider webhooks with deduplication' })
  @ApiResponse({ status: 200, description: 'Webhook received' })
  async handleWebhook(
    @Param('provider') provider: string,
    @Body() payload: unknown,
    @Headers() headers: Record<string, string>,
  ) {
    const result = await this.eventsService.handleInboundWebhook(
      provider,
      payload,
      headers,
    );
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }
}
