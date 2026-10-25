import { Module } from '@nestjs/common';
import { PlanningController } from './planning.controller';
import { PlanningService } from './planning.service';
import { PlanAutopsyService } from './autopsy/plan-autopsy.service';
import { AgentModule } from '../agent/agent.module';

@Module({
  imports: [AgentModule],
  controllers: [PlanningController],
  providers: [PlanningService, PlanAutopsyService],
  exports: [PlanningService, PlanAutopsyService],
})
export class PlanningModule {}
