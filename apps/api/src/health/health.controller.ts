import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { PrismaService } from '../database/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({ status: 200, description: 'Application process is alive' })
  getLiveness() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiResponse({ status: 200, description: 'Application infrastructure is ready' })
  @ApiResponse({ status: 503, description: 'Dependencies not ready' })
  async getReadiness(@Res() res: Response) {
    let dbStatus = 'disconnected';
    let isReady = true;

    try {
      if (this.prisma.isConnected) {
        await this.prisma.$queryRaw`SELECT 1`;
        dbStatus = 'connected';
      } else {
        dbStatus = 'reconnecting';
        isReady = false;
      }
    } catch {
      dbStatus = 'error';
      isReady = false;
    }

    const payload = {
      status: isReady ? 'ok' : 'degraded',
      services: {
        database: dbStatus,
        api: 'running',
      },
      timestamp: new Date().toISOString(),
    };

    return res
      .status(isReady ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
      .json(payload);
  }
}
