import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  AuthenticatedUserContext,
  CreateGoalDto,
  UpdateGoalDto,
} from '@adaptive-planner/contracts';
import { GoalsService } from './goals.service';

@ApiTags('Goals')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new goal with optional milestones' })
  @ApiResponse({ status: 201, description: 'Goal created successfully' })
  async createGoal(
    @Body() dto: CreateGoalDto,
    @CurrentUser() user: AuthenticatedUserContext,
  ) {
    const goal = await this.goalsService.createGoal(dto, user);
    return {
      success: true,
      data: goal,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'List all goals in current workspace' })
  @ApiResponse({ status: 200, description: 'Goals retrieved successfully' })
  async listGoals(@CurrentUser() user: AuthenticatedUserContext) {
    const goals = await this.goalsService.listGoals(user);
    return {
      success: true,
      data: goals,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get goal details by ID' })
  async getGoal(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserContext,
  ) {
    const goal = await this.goalsService.getGoalById(id, user);
    return {
      success: true,
      data: goal,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id/tasks')
  @ApiOperation({ summary: 'Get all tasks associated with a goal' })
  async getGoalTasks(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserContext,
  ) {
    const goal = await this.goalsService.getGoalById(id, user);
    return {
      success: true,
      data: (goal as any)?.tasks || [],
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing goal' })
  async updateGoal(
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
    @CurrentUser() user: AuthenticatedUserContext,
  ) {
    const goal = await this.goalsService.updateGoal(id, dto, user);
    return {
      success: true,
      data: goal,
      timestamp: new Date().toISOString(),
    };
  }
}
