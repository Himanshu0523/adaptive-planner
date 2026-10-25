import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  AuthenticatedUserContext,
  StartAgentRunDto,
} from '@adaptive-planner/contracts';
import { AgentPipelineService } from './orchestration/agent-pipeline.service';

@ApiTags('Agent')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('agent')
export class AgentController {
  constructor(private readonly agentPipeline: AgentPipelineService) {}

  @Post('runs')
  @ApiOperation({ summary: 'Start a goal-aware personal AI agent run' })
  @ApiResponse({ status: 202, description: 'Agent run dispatched' })
  async startRun(
    @Body() dto: StartAgentRunDto,
    @CurrentUser() user: AuthenticatedUserContext,
  ) {
    const run = await this.agentPipeline.startRun(dto, user);
    return {
      success: true,
      data: run,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('runs/:id')
  @ApiOperation({ summary: 'Inspect agent run progress and tool execution status' })
  @ApiResponse({ status: 200, description: 'Run details returned' })
  async getRun(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserContext,
  ) {
    const run = await this.agentPipeline.getRunById(id, user);
    return {
      success: true,
      data: run,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('runs/:id/resume')
  @ApiOperation({ summary: 'Resume an interrupted agent run from the exact uncompleted step' })
  @ApiResponse({ status: 200, description: 'Run resumed without re-executing completed steps' })
  async resumeRun(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserContext,
  ) {
    const run = await this.agentPipeline.resumeRun(id, user);
    return {
      success: true,
      data: run,
      timestamp: new Date().toISOString(),
    };
  }
}
