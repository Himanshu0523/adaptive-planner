import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class MemoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecentMemories(workspaceId: string, userId: string) {
    if (this.prisma.isConnected) {
      return this.prisma.userMemory.findMany({
        where: { workspaceId, userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
    }
    return [];
  }

  async storeMemory(
    workspaceId: string,
    userId: string,
    content: string,
    memoryType: 'PREFERENCE' | 'FACT' | 'CONSTRAINT' | 'TEMPORAL' = 'FACT',
  ) {
    if (this.prisma.isConnected) {
      return this.prisma.userMemory.create({
        data: {
          workspaceId,
          userId,
          memoryType,
          content,
          source: 'interaction',
        },
      });
    }
    return { id: `mem_${Date.now()}`, content, memoryType };
  }
}
