import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../database/prisma.service';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: jest.Mocked<Partial<PrismaService>>;

  const mockAuditEventCreate = jest.fn().mockResolvedValue({ id: 'audit_001' });

  beforeEach(async () => {
    const mockPrisma = {
      isConnected: true,
      auditEvent: {
        create: mockAuditEventCreate,
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logAction', () => {
    it('creates an audit event when DB is connected', async () => {
      (prisma as any).isConnected = true;
      await service.logAction(
        'ws_test_001',
        'usr_test_001',
        'GOAL_CREATED',
        'Goal',
        'goal_test_001',
        { title: 'Test Goal' },
      );
      expect((prisma as any).auditEvent.create).toHaveBeenCalledWith({
        data: {
          workspaceId: 'ws_test_001',
          actorId: 'usr_test_001',
          actorType: 'USER',
          action: 'GOAL_CREATED',
          targetType: 'Goal',
          targetId: 'goal_test_001',
          metadata: { title: 'Test Goal' },
        },
      });
    });

    it('silently skips audit logging when DB is disconnected', async () => {
      (prisma as any).isConnected = false;
      // Should not throw and should not call prisma
      await service.logAction('ws_test_001', 'usr_test_001', 'TASK_UPDATED', 'Task', 'task_001');
      expect((prisma as any).auditEvent.create).not.toHaveBeenCalled();
    });

    it('catches and swallows DB errors to prevent disrupting request flow', async () => {
      (prisma as any).isConnected = true;
      (prisma as any).auditEvent.create = jest.fn().mockRejectedValue(new Error('DB write failed'));
      // Should not throw
      await expect(
        service.logAction('ws_test_001', 'usr_test_001', 'PLAN_APPROVED', 'Plan', 'plan_001'),
      ).resolves.toBeUndefined();
    });

    it('works without optional metadata', async () => {
      (prisma as any).isConnected = true;
      await service.logAction('ws_test_001', 'usr_test_001', 'TASK_DELETED', 'Task', 'task_001');
      expect((prisma as any).auditEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'TASK_DELETED',
          metadata: undefined,
        }),
      });
    });
  });
});
