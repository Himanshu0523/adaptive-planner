import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../database/prisma.service';
import { AuthenticatedUserContext } from '@adaptive-planner/contracts';

const mockUser: AuthenticatedUserContext = {
  userId: 'usr_test_001',
  email: 'test@example.com',
  displayName: 'Test User',
  workspaceId: 'ws_test_001',
  role: 'OWNER',
};

const mockTask = {
  id: 'task_test_001',
  workspaceId: 'ws_test_001',
  goalId: 'goal_test_001',
  milestoneId: null,
  title: 'Test Task Focus Block',
  notes: 'Notes for testing',
  status: 'TODO',
  estimatedMinutes: 30,
  dueAt: new Date(),
  priority: 'MEDIUM',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('TasksService', () => {
  let service: TasksService;
  let prisma: jest.Mocked<Partial<PrismaService>>;

  beforeEach(async () => {
    const mockPrisma = {
      isConnected: true,
      task: {
        create: jest.fn().mockResolvedValue(mockTask),
        findMany: jest.fn().mockResolvedValue([mockTask]),
        findFirst: jest.fn().mockResolvedValue(mockTask),
        update: jest.fn().mockResolvedValue({ ...mockTask, status: 'DONE' }),
        delete: jest.fn().mockResolvedValue(mockTask),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTask', () => {
    it('should create a task with default estimated minutes', async () => {
      const result = await service.createTask(
        {
          title: 'Pass technical interview prep',
          estimatedMinutes: 45,
        },
        mockUser,
      );

      expect(prisma.task?.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Pass technical interview prep',
            workspaceId: mockUser.workspaceId,
            estimatedMinutes: 45,
            status: 'TODO',
          }),
        }),
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('getTodayFocus', () => {
    it('should return tasks for the daily execution focus', async () => {
      const result = await service.getTodayFocus(mockUser);
      expect(prisma.task?.findMany).toHaveBeenCalled();
      expect(result).toEqual([mockTask]);
    });
  });

  describe('updateTask', () => {
    it('should update task status from TODO to DONE', async () => {
      const result = await service.updateTask(
        mockTask.id,
        { status: 'DONE' },
        mockUser,
      );

      expect(prisma.task?.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockTask.id },
          data: expect.objectContaining({ status: 'DONE' }),
        }),
      );
      expect(result.status).toBe('DONE');
    });

    it('should throw NotFoundException if task does not exist', async () => {
      (prisma.task?.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateTask('non_existent', { status: 'DONE' }, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
