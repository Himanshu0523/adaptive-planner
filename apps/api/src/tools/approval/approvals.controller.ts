import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  AuthenticatedUserContext,
  ApprovalDecisionDto,
} from '@adaptive-planner/contracts';
import { ApprovalsService } from './approvals.service';

@ApiTags('Approvals')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get()
  @ApiOperation({ summary: 'List pending actions awaiting user approval' })
  @ApiResponse({ status: 200, description: 'Pending approvals retrieved' })
  async listPending(@CurrentUser() user: AuthenticatedUserContext) {
    const pending = await this.approvalsService.listPendingApprovals(user);
    return {
      success: true,
      data: pending,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/decision')
  @ApiOperation({ summary: 'Approve or reject a pending tool action' })
  @ApiResponse({ status: 200, description: 'Decision recorded successfully' })
  async submitDecision(
    @Param('id') id: string,
    @Body() dto: ApprovalDecisionDto,
    @CurrentUser() user: AuthenticatedUserContext,
  ) {
    const result = await this.approvalsService.recordDecision(id, dto, user);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }
}
