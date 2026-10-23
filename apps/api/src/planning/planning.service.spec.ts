import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PlanningService } from './planning.service';
import { PrismaService } from '../database/prisma.service';
import { GeminiGatewayService } from '../agent/model-gateway/gemini-gateway.service';
import { ToolRegistryService } from '../tools/registry/tool-registry.service';
import { AuthenticatedUserContext } from '@adaptive-planner/contracts';

const mockUser: AuthenticatedUserContext = {
  userId: 'usr_test_001',
  email: 'test@example.com',
  displayName: 'Test User',
  workspaceId: 'ws_test_001',
  role: 'OWNER',
};

describe('PlanningService', () => {
  let service: PlanningService;
  let prisma: jest.Mocked<Partial<PrismaService>>;
  let gemini: jest.Mocked<Partial<GeminiGatewayService>>;

  beforeEach(async () => {
    const mockPrisma = {
      isConnected: true,
      goal: {
        create: jest.fn().mockResolvedValue({ id: 'goal_new_001' }),
      },
      task: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: `task_${Date.now()}`, ...data })),
      },
    };

    const mockGemini = {
      generateStructuredPlan: jest.fn().mockResolvedValue({
        intent: 'Prepare for certifications in 4 weeks',
        assumptions: ['User has 45 minutes daily capacity'],
        tradeOffs: ['Focuses on high-yield exam domains first'],
        steps: [
          {
            stepNumber: 1,
            title: 'Diagnostic assessment exam',
            description: 'Identify knowledge gaps',
            estimatedMinutes: 45,
            suggestedDayOffset: 0,
            riskLevel: 'LOW_RISK_INTERNAL_WRITE',
          },
          {
            stepNumber: 2,
            title: 'Deep dive on weakest domain',
            description: 'Study core whitepapers',
            estimatedMinutes: 60,
            suggestedDayOffset: 2,
            riskLevel: 'LOW_RISK_INTERNAL_WRITE',
          },
        ],
      }),
    };

    const mockRegistry = {
      getAllTools: jest.fn().mockReturnValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanningService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: GeminiGatewayService, useValue: mockGemini },
        { provide: ToolRegistryService, useValue: mockRegistry },
      ],
    }).compile();

    service = module.get<PlanningService>(PlanningService);
    prisma = module.get(PrismaService);
    gemini = module.get(GeminiGatewayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateProposedPlan', () => {
    it('should generate a proposed plan with steps and risk assessment', async () => {
      const plan = await service.generateProposedPlan(
        {
          naturalLanguageIntent: 'Prepare for certifications in 4 weeks',
          availableHoursPerDay: 1,
        },
        mockUser,
      );

      expect(plan).toBeDefined();
      expect(plan.planId).toMatch(/^plan_/);
      expect(plan.intent).toBe('Prepare for certifications in 4 weeks');
      expect(plan.steps.length).toBe(2);
      expect(plan.totalEstimatedMinutes).toBe(105);
    });
  });

  describe('approvePlan', () => {
    it('should materialize plan into goal and actionable tasks', async () => {
      const plan = await service.generateProposedPlan(
        {
          naturalLanguageIntent: 'Prepare for certifications in 4 weeks',
          availableHoursPerDay: 1,
        },
        mockUser,
      );

      const approved = await service.approvePlan(
        plan.planId,
        { approvedStepIndices: [0, 1] },
        mockUser,
      );

      expect(approved.status).toBe('MATERIALIZED');
      expect(approved.materializedTasksCount).toBe(2);
      expect(prisma.goal?.create).toHaveBeenCalled();
      expect(prisma.task?.create).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException for invalid or missing planId', async () => {
      await expect(
        service.approvePlan('non_existent_plan_id', {}, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
