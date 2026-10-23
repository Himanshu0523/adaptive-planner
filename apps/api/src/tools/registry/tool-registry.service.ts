import { Injectable, Logger } from '@nestjs/common';
import {
  IntegrationAdapter,
  ToolDefinition,
} from '@adaptive-planner/tool-sdk';

@Injectable()
export class ToolRegistryService {
  private readonly logger = new Logger(ToolRegistryService.name);
  private readonly adapters = new Map<string, IntegrationAdapter>();

  registerAdapter(adapter: IntegrationAdapter) {
    this.adapters.set(adapter.providerId, adapter);
    this.logger.log(
      `Registered adapter: ${adapter.providerId} (${adapter.displayName}) with ${
        adapter.listTools().length
      } tools`,
    );
  }

  getAdapter(providerId: string): IntegrationAdapter | undefined {
    return this.adapters.get(providerId);
  }

  getAllAdapters(): IntegrationAdapter[] {
    return Array.from(this.adapters.values());
  }

  getAllTools(): Array<{ providerId: string; tool: ToolDefinition }> {
    const list: Array<{ providerId: string; tool: ToolDefinition }> = [];
    for (const [providerId, adapter] of this.adapters.entries()) {
      for (const tool of adapter.listTools()) {
        list.push({ providerId, tool });
      }
    }
    return list;
  }

  findTool(toolName: string): { adapter: IntegrationAdapter; tool: ToolDefinition } | undefined {
    for (const adapter of this.adapters.values()) {
      const tool = adapter.listTools().find((t) => t.name === toolName);
      if (tool) {
        return { adapter, tool };
      }
    }
    return undefined;
  }
}
