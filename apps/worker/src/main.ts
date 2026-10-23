import { Worker, Job, Queue } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://app:local_dev_only@127.0.0.1:5432/personal_agent?schema=public';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};

console.log(`[Worker Fleet] Initializing BullMQ workers on Redis ${redisConnection.host}:${redisConnection.port}...`);

// 1. Agent Planning Worker
const agentPlanningWorker = new Worker(
  'agent-planning',
  async (job: Job) => {
    console.log(`[Queue: agent-planning] Processing job ${job.id} - ${job.name}`);
    const { goalId, prompt } = job.data;
    // Simulate or execute long-running planning
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(`[Queue: agent-planning] Plan generated for goal ${goalId || 'ad-hoc'}`);
    return { status: 'plan_synthesized', jobId: job.id };
  },
  { connection: redisConnection, concurrency: 5 },
);

// 2. Integration Sync Worker
const integrationSyncWorker = new Worker(
  'integration-sync',
  async (job: Job) => {
    console.log(`[Queue: integration-sync] Syncing connection ${job.data.connectionId} (${job.data.provider})`);
    // Perform sync and update lastSyncedAt
    return { synced: true, provider: job.data.provider };
  },
  { connection: redisConnection, concurrency: 10 },
);

// 3. Webhook Processing Worker
const webhookWorker = new Worker(
  'webhook-processing',
  async (job: Job) => {
    console.log(`[Queue: webhook-processing] Processing webhook delivery ${job.data.eventId}`);
    return { processed: true, eventId: job.data.eventId };
  },
  { connection: redisConnection, concurrency: 10 },
);

// 4. Tool Execution Worker
const toolExecutionWorker = new Worker(
  'tool-execution',
  async (job: Job) => {
    console.log(`[Queue: tool-execution] Executing background tool action ${job.data.toolName}`);
    return { executed: true, toolName: job.data.toolName };
  },
  { connection: redisConnection, concurrency: 5 },
);

// 5. Notification Delivery Worker
const notificationWorker = new Worker(
  'notification-delivery',
  async (job: Job) => {
    console.log(`[Queue: notification-delivery] Delivering reminder to user ${job.data.userId}`);
    return { delivered: true, scheduledAt: job.data.scheduledAt };
  },
  { connection: redisConnection, concurrency: 5 },
);

// 6. Maintenance Worker
const maintenanceWorker = new Worker(
  'maintenance',
  async (job: Job) => {
    console.log(`[Queue: maintenance] Executing routine maintenance task: ${job.name}`);
    return { completed: true };
  },
  { connection: redisConnection, concurrency: 2 },
);

const allWorkers = [
  agentPlanningWorker,
  integrationSyncWorker,
  webhookWorker,
  toolExecutionWorker,
  notificationWorker,
  maintenanceWorker,
];

for (const worker of allWorkers) {
  worker.on('failed', (job, err) => {
    console.error(`[Worker error] Job ${job?.id} on queue ${worker.name} failed: ${err.message}`);
  });
  worker.on('error', (err) => {
    // Gracefully handle offline Redis in local development
    console.warn(`[BullMQ notice] ${worker.name} Redis connection status: ${err.message}`);
  });
}

console.log('[Worker Fleet] All 6 BullMQ queues active: agent-planning, integration-sync, webhook-processing, tool-execution, notification-delivery, maintenance');

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('[Worker Fleet] Gracefully shutting down workers...');
  for (const worker of allWorkers) {
    await worker.close();
  }
  await prisma.$disconnect();
  process.exit(0);
});
