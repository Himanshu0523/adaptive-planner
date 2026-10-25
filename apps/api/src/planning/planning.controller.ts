import {
  Controller,
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
  GeneratePlanRequestDto,
  ApprovePlanRequestDto,
} from '@adaptive-planner/contracts';
import { PlanningService } from './planning.service';
import { PlanAutopsyService, TaskSlipMetrics } from './autopsy/plan-autopsy.service';

@ApiTags('Planning')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('plans')
export class PlanningController {
  constructor(
    private readonly planningService: PlanningService,
    private readonly autopsyService: PlanAutopsyService,
  ) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a structured proposed plan using AI Model Gateway' })
  @ApiResponse({ status: 200, description: 'Proposed plan generated' })
  async generatePlan(
    @Body() dto: GeneratePlanRequestDto,
    @CurrentUser() user: AuthenticatedUserContext,
  ) {
    const plan = await this.planningService.generateProposedPlan(dto, user);
    return {
      success: true,
      data: plan,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a proposed plan and materialize tasks into database' })
  @ApiResponse({ status: 200, description: 'Plan approved and materialized' })
  async approvePlan(
    @Param('id') id: string,
    @Body() dto: ApprovePlanRequestDto,
    @CurrentUser() user: AuthenticatedUserContext,
  ) {
    const result = await this.planningService.approvePlan(id, dto, user);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('autopsy')
  @ApiOperation({ summary: 'Run deterministic Plan Autopsy on a slip and rank recovery paths' })
  @ApiResponse({ status: 200, description: 'Plan Autopsy performed with ranked recovery options' })
  async runAutopsy(
    @Body() metrics: TaskSlipMetrics,
    @CurrentUser() user: AuthenticatedUserContext,
  ) {
    const result = await this.autopsyService.performAutopsy(metrics, user.workspaceId);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }
}
