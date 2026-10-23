import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  AuthenticatedUserContext,
  ApprovalDecisionDto,
} from '@adaptive-planner/contracts';

@Injectable()
export class ApprovalsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPendingApprovals(user: AuthenticatedUserContext) {
    if (this.prisma.isConnected) {
      return this.prisma.actionApproval.findMany({
        where: {
          workspaceId: user.workspaceId,
          status: 'PENDING',
          expiresAt: { gt: new Date() },
        },
        include: {
          toolCall: true,
          requester: { select: { id: true, displayName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return [];
  }

  async recordDecision(
    approvalId: string,
    dto: ApprovalDecisionDto,
    user: AuthenticatedUserContext,
  ) {
    if (this.prisma.isConnected) {
      const approval = await this.prisma.actionApproval.findFirst({
        where: { id: approvalId, workspaceId: user.workspaceId },
        include: { toolCall: true },
      });

      if (!approval) {
        throw new NotFoundException(`Action approval ${approvalId} not found`);
      }

      if (approval.status !== 'PENDING') {
        throw new BadRequestException(
          `Action approval already resolved with status: ${approval.status}`,
        );
      }

      const isApproved = dto.decision === 'APPROVE';
      const updatedStatus = isApproved ? 'APPROVED' : 'REJECTED';

      const updatedApproval = await this.prisma.actionApproval.update({
        where: { id: approvalId },
        data: {
          status: updatedStatus,
          decisionById: user.userId,
          decisionAt: new Date(),
        },
      });

      // Update associated tool call status
      await this.prisma.toolCall.update({
        where: { id: approval.toolCallId },
        data: {
          status: isApproved ? 'APPROVED' : 'REJECTED',
        },
      });

      return updatedApproval;
    }

    return {
      id: approvalId,
      status: dto.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      decisionAt: new Date().toISOString(),
      decisionById: user.userId,
    };
  }
}
