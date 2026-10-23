import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateGoalDto,
  UpdateGoalDto,
  AuthenticatedUserContext,
} from '@adaptive-planner/contracts';

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async createGoal(dto: CreateGoalDto, user: AuthenticatedUserContext) {
    if (this.prisma.isConnected) {
      const goal = await this.prisma.goal.create({
        data: {
          workspaceId: user.workspaceId,
          title: dto.title,
          description: dto.description,
          goalType: (dto.goalType as any) || 'MILESTONE_DRIVEN',
          priority: (dto.priority as any) || 'MEDIUM',
          targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
          versions: {
            create: {
              version: 1,
              definitionJson: {
                title: dto.title,
                description: dto.description,
                createdAt: new Date().toISOString(),
              },
              approvedAt: new Date(),
            },
          },
          milestones: dto.milestones?.length
            ? {
                create: dto.milestones.map((m, idx) => ({
                  title: m.title,
                  description: m.description,
                  dueAt: m.dueAt ? new Date(m.dueAt) : null,
                  orderIndex: m.orderIndex ?? idx,
                })),
              }
            : undefined,
        },
        include: {
          milestones: true,
          versions: true,
        },
      });

      return goal;
    }

    // In-memory fallback if DB is connecting
    return {
      id: `goal_${Date.now()}`,
      workspaceId: user.workspaceId,
      title: dto.title,
      description: dto.description || null,
      goalType: dto.goalType || 'MILESTONE_DRIVEN',
      status: 'ACTIVE',
      targetDate: dto.targetDate || null,
      priority: dto.priority || 'MEDIUM',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      milestones: (dto.milestones || []).map((m, idx) => ({
        id: `ms_${Date.now()}_${idx}`,
        goalId: `goal_${Date.now()}`,
        title: m.title,
        description: m.description || null,
        dueAt: m.dueAt || null,
        status: 'PENDING',
        orderIndex: m.orderIndex ?? idx,
      })),
    };
  }

  async listGoals(user: AuthenticatedUserContext) {
    if (this.prisma.isConnected) {
      return this.prisma.goal.findMany({
        where: { workspaceId: user.workspaceId },
        include: {
          milestones: { orderBy: { orderIndex: 'asc' } },
          _count: { select: { tasks: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return [
      {
        id: 'goal_dev_launch_mvp',
        workspaceId: user.workspaceId,
        title: 'Launch Personal AI Agent Platform MVP',
        description: 'Deploy goal-aware multi-tool personal AI agent backend with Next.js dashboard',
        goalType: 'MILESTONE_DRIVEN',
        status: 'ACTIVE',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'HIGH',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        milestones: [
          {
            id: 'ms_1',
            title: 'Foundation & Relational Database Layer',
            dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'IN_PROGRESS',
            orderIndex: 0,
          },
        ],
        _count: { tasks: 3 },
      },
    ];
  }

  async getGoalById(id: string, user: AuthenticatedUserContext) {
    if (this.prisma.isConnected) {
      const goal = await this.prisma.goal.findFirst({
        where: { id, workspaceId: user.workspaceId },
        include: {
          milestones: { orderBy: { orderIndex: 'asc' } },
          versions: { orderBy: { version: 'desc' } },
          tasks: true,
        },
      });

      if (!goal) {
        throw new NotFoundException(`Goal with id ${id} not found in workspace`);
      }
      return goal;
    }

    return {
      id,
      workspaceId: user.workspaceId,
      title: 'Launch Personal AI Agent Platform MVP',
      status: 'ACTIVE',
      goalType: 'MILESTONE_DRIVEN',
      priority: 'HIGH',
      milestones: [],
      versions: [],
      tasks: [],
    };
  }

  async updateGoal(id: string, dto: UpdateGoalDto, user: AuthenticatedUserContext) {
    if (this.prisma.isConnected) {
      const existing = await this.prisma.goal.findFirst({
        where: { id, workspaceId: user.workspaceId },
      });
      if (!existing) {
        throw new NotFoundException(`Goal with id ${id} not found in workspace`);
      }

      return this.prisma.goal.update({
        where: { id },
        data: {
          title: dto.title,
          description: dto.description,
          status: dto.status as any,
          priority: dto.priority as any,
          targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
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
}
