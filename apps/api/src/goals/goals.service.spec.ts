import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { PrismaService } from '../database/prisma.service';
import { AuthenticatedUserContext, CreateGoalDto, UpdateGoalDto } from '@adaptive-planner/contracts';

const mockUser: AuthenticatedUserContext = {
  userId: 'usr_test_001',
  email: 'test@example.com',
  displayName: 'Test User',
  workspaceId: 'ws_test_001',
  role: 'OWNER',
};

const mockGoal = {
  id: 'goal_test_001',
  workspaceId: 'ws_test_001',
  title: 'Test Goal',
  description: 'A sample goal for unit testing',
  goalType: 'MILESTONE_DRIVEN',
  status: 'ACTIVE',
  targetDate: null,
  priority: 'MEDIUM',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  milestones: [],
  versions: [],
};

describe('GoalsService', () => {
  let service: GoalsService;
  let prisma: jest.Mocked<Partial<PrismaService>>;

  beforeEach(async () => {
    const mockPrisma = {
      isConnected: true,
      goal: {
        create: jest.fn().mockResolvedValue(mockGoal),
        findMany: jest.fn().mockResolvedValue([mockGoal]),
        findFirst: jest.fn().mockResolvedValue(mockGoal),
        update: jest.fn().mockResolvedValue({ ...mockGoal, title: 'Updated Title' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<GoalsService>(GoalsService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createGoal', () => {
    it('creates a goal with DB connected', async () => {
      const dto: CreateGoalDto = { title: 'Test Goal', description: 'A sample goal for unit testing' };
      const result = await service.createGoal(dto, mockUser);
      expect(result.title).toBe('Test Goal');
      expect((prisma as any).goal.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            workspaceId: mockUser.workspaceId,
            title: dto.title,
          }),
        }),
      );
    });

    it('returns in-memory fallback when DB is disconnected', async () => {
      (prisma as any).isConnected = false;
      const dto: CreateGoalDto = { title: 'Offline Goal' };
      const result = await service.createGoal(dto, mockUser);
      expect(result.title).toBe('Offline Goal');
      expect(result.workspaceId).toBe(mockUser.workspaceId);
      expect((prisma as any).goal.create).not.toHaveBeenCalled();
    });
  });

  describe('listGoals', () => {
    it('returns goals from DB filtered by workspaceId', async () => {
      const result = await service.listGoals(mockUser);
      expect(Array.isArray(result)).toBe(true);
      expect((prisma as any).goal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { workspaceId: mockUser.workspaceId },
        }),
      );
    });

    it('returns mock goals when DB is disconnected', async () => {
      (prisma as any).isConnected = false;
      const result = await service.listGoals(mockUser);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getGoalById', () => {
    it('returns a goal when found in workspace', async () => {
      const result = await service.getGoalById('goal_test_001', mockUser);
      expect(result.id).toBe('goal_test_001');
    });

    it('throws NotFoundException when goal is not found', async () => {
      (prisma as any).goal.findFirst = jest.fn().mockResolvedValue(null);
      await expect(service.getGoalById('nonexistent', mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateGoal', () => {
    it('updates a goal when found', async () => {
      const dto: UpdateGoalDto = { title: 'Updated Title' };
      const result = await service.updateGoal('goal_test_001', dto, mockUser);
      expect(result.title).toBe('Updated Title');
    });

    it('throws NotFoundException when goal to update is not found', async () => {
      (prisma as any).goal.findFirst = jest.fn().mockResolvedValue(null);
      const dto: UpdateGoalDto = { title: 'Updated' };
      await expect(service.updateGoal('nonexistent', dto, mockUser)).rejects.toThrow(NotFoundException);
    });
  });
});
