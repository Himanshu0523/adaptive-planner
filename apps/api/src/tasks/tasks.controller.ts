import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  AuthenticatedUserContext,
  CreateTaskDto,
  UpdateTaskDto,
} from '@adaptive-planner/contracts';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('today')
  @ApiOperation({ summary: 'Get current daily action focus tasks' })
  @ApiResponse({ status: 200, description: 'Daily focus tasks retrieved' })
  async getTodayFocus(@CurrentUser() user: AuthenticatedUserContext) {
    const tasks = await this.tasksService.getTodayFocus(user);
    return {
      success: true,
      data: tasks,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  async createTask(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: AuthenticatedUserContext,
  ) {
    const task = await this.tasksService.createTask(dto, user);
    return {
      success: true,
      data: task,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'List all tasks with optional filters' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'goalId', required: false })
  async listTasks(
    @CurrentUser() user: AuthenticatedUserContext,
    @Query('status') status?: string,
    @Query('goalId') goalId?: string,
  ) {
    const tasks = await this.tasksService.listTasks(user, { status, goalId });
    return {
      success: true,
      data: tasks,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task status or attributes' })
  async updateTask(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: AuthenticatedUserContext,
  ) {
    const task = await this.tasksService.updateTask(id, dto, user);
    return {
      success: true,
      data: task,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update task status' })
  async updateTaskStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser() user: AuthenticatedUserContext,
  ) {
    const task = await this.tasksService.updateTask(id, { status: status as any }, user);
    return {
      success: true,
      data: task,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  async deleteTask(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserContext,
  ) {
    const result = await this.tasksService.deleteTask(id, user);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }
}

