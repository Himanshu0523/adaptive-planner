import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  AuthenticatedUserContext,
} from '@adaptive-planner/contracts';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async createTask(dto: CreateTaskDto, user: AuthenticatedUserContext) {
    if (this.prisma.isConnected) {
      return this.prisma.task.create({
        data: {
          workspaceId: user.workspaceId,
          goalId: dto.goalId,
          milestoneId: dto.milestoneId,
          title: dto.title,
          notes: dto.notes,
          estimatedMinutes: dto.estimatedMinutes ?? 30,
          dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
          priority: (dto.priority as any) || 'MEDIUM',
          status: 'TODO',
          dependencies: dto.dependsOnTaskIds?.length
            ? {
                create: dto.dependsOnTaskIds.map((prereqId) => ({
                  dependsOnTaskId: prereqId,
                })),
              }
            : undefined,
        },
        include: {
          dependencies: true,
        },
      });
    }

    return {
      id: `task_${Date.now()}`,
      workspaceId: user.workspaceId,
      ...dto,
      status: 'TODO',
      estimatedMinutes: dto.estimatedMinutes || 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async listTasks(
    user: AuthenticatedUserContext,
    filters?: { status?: string; goalId?: string },
  ) {
    if (this.prisma.isConnected) {
      const where: Record<string, unknown> = {
        workspaceId: user.workspaceId,
      };

      if (filters?.status) where.status = filters.status;
      if (filters?.goalId) where.goalId = filters.goalId;

      return this.prisma.task.findMany({
        where,
        include: {
          goal: { select: { id: true, title: true } },
          milestone: { select: { id: true, title: true } },
        },
        orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
      });
    }

    return [
      {
        id: 'task-1',
        workspaceId: user.workspaceId,
        title: 'Verify Prisma database migration and seed data',
        notes: 'Ensure all 16 tables match architectural specification',
        status: 'IN_PROGRESS',
        estimatedMinutes: 30,
        dueAt: new Date().toISOString(),
        priority: 'HIGH',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  async getTodayFocus(user: AuthenticatedUserContext) {
    if (this.prisma.isConnected) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      return this.prisma.task.findMany({
        where: {
          workspaceId: user.workspaceId,
          OR: [
            { dueAt: { lte: endOfDay } },
            { status: 'IN_PROGRESS' },
          ],
        },
        include: {
          goal: { select: { id: true, title: true } },
        },
        orderBy: [{ status: 'desc' }, { priority: 'desc' }],
      });
    }

    return [
      {
        id: 'task-today-1',
        workspaceId: user.workspaceId,
        title: 'Verify NestJS API live and ready endpoints',
        status: 'IN_PROGRESS',
        estimatedMinutes: 20,
        priority: 'HIGH',
      },
    ];
  }

  async updateTask(id: string, dto: UpdateTaskDto, user: AuthenticatedUserContext) {
    if (this.prisma.isConnected) {
      const task = await this.prisma.task.findFirst({
        where: { id, workspaceId: user.workspaceId },
      });
      if (!task) {
        throw new NotFoundException(`Task ${id} not found in workspace`);
      }

      return this.prisma.task.update({
        where: { id },
        data: {
          title: dto.title,
          notes: dto.notes,
          status: dto.status as any,
          estimatedMinutes: dto.estimatedMinutes,
          dueAt: dto.dueAt ? new Date(dto.dueAt) : dto.dueAt === null ? null : undefined,
          priority: dto.priority as any,
          completedAt:
            dto.status === 'DONE' && !task.completedAt
              ? new Date()
              : dto.status && dto.status !== 'DONE'
              ? null
              : undefined,
        },
      });
    }

    return {
      id,
      workspaceId: user.workspaceId,
      ...dto,
      updatedAt: new Date().toISOString(),
    };
  }

  async deleteTask(id: string, user: AuthenticatedUserContext) {
    if (this.prisma.isConnected) {
      const task = await this.prisma.task.findFirst({
        where: { id, workspaceId: user.workspaceId },
      });
      if (!task) {
        throw new NotFoundException(`Task ${id} not found in workspace`);
      }
      await this.prisma.task.delete({ where: { id } });
      return { id };
    }

    return { id };
  }
}

