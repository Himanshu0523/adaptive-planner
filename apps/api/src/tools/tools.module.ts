import { Module, Global } from '@nestjs/common';
import { ToolRegistryService } from './registry/tool-registry.service';
import { ToolPolicyService } from './policy/tool-policy.service';
import { ToolExecutionService } from './execution/tool-execution.service';
import { ApprovalsService } from './approval/approvals.service';
import { ApprovalsController } from './approval/approvals.controller';

@Global()
@Module({
  controllers: [ApprovalsController],
  providers: [
    ToolRegistryService,
    ToolPolicyService,
    ToolExecutionService,
    ApprovalsService,
  ],
  exports: [
    ToolRegistryService,
    ToolPolicyService,
    ToolExecutionService,
    ApprovalsService,
  ],
})
export class ToolsModule {}
