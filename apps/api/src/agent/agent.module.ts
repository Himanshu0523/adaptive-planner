import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentPipelineService } from './orchestration/agent-pipeline.service';
import { GeminiGatewayService } from './model-gateway/gemini-gateway.service';

@Module({
  controllers: [AgentController],
  providers: [AgentPipelineService, GeminiGatewayService],
  exports: [AgentPipelineService, GeminiGatewayService],
})
export class AgentModule {}
