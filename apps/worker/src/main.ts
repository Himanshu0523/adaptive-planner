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

// 1. Dedicated Stateful Agent Run Worker (Phase 1: Low concurrency, step resumption)
const agentRunWorker = new Worker(
  'agent-run',
  async (job: Job) => {
    const { runId, workspaceId, userId } = job.data;
    console.log(`[Queue: agent-run] Processing stateful run ${runId} (concurrency: 1)...`);

    try {
      // Find agent run with steps in order
      const run = await prisma.agentRun.findUnique({
        where: { id: runId },
        include: { steps: { orderBy: { stepNumber: 'asc' } } },
      });

      if (!run) {
        console.warn(`[Queue: agent-run] Run ${runId} not found, skipping.`);
        return { status: 'not_found' };
      }

      console.log(`[Queue: agent-run] Run ${runId} has ${run.steps.length} steps. Checking for resumption...`);

      // Step-by-step execution saving state as it happens
      for (const step of run.steps) {
        if (step.status === 'COMPLETED') {
          console.log(`[Queue: agent-run] Step ${step.stepNumber} already COMPLETED. Skipping.`);
          continue;
        }

        console.log(`[Queue: agent-run] Executing Step ${step.stepNumber}: ${step.name}`);
        const startTime = Date.now();

        await prisma.agentStep.update({
          where: { id: step.id },
          data: { status: 'RUNNING', startedAt: new Date() },
        });

        // Step simulation / tool execution
        await new Promise((r) => setTimeout(r, 600));
        const durationMs = Date.now() - startTime;

        await prisma.agentStep.update({
          where: { id: step.id },
          data: {
            status: 'COMPLETED',
            durationMs,
            outputPayload: { executed: true, at: new Date().toISOString() },
            finishedAt: new Date(),
          },
        });
      }

      // Batch result into Daily Review Digest instead of immediate notification interruption
      await prisma.dailyReviewDigestItem.create({
        data: {
          workspaceId,
          userId,
          agentRunId: runId,
          title: `Autonomous Run: ${run.prompt.slice(0, 45)}`,
          summary: `Completed all ${run.steps.length} steps safely with zero interruptions.`,
          status: 'PENDING_REVIEW',
        },
      });

      await prisma.agentRun.update({
        where: { id: runId },
        data: { status: 'SUCCEEDED', finishedAt: new Date() },
      });

      console.log(`[Queue: agent-run] Run ${runId} completed successfully and added to daily digest.`);
      return { status: 'completed', runId };
    } catch (err: any) {
      console.error(`[Queue: agent-run] Error during run ${runId}: ${err.message}`);
      throw err;
    }
  },
  { connection: redisConnection, concurrency: 1 }, // Required: Low concurrency
);

// 2. Exit Ramp Evaluator Worker (Phase 3: Pre-committed pivot signals)
const exitRampWorker = new Worker(
  'exit-ramp-checker',
  async (job: Job) => {
    console.log('[Queue: exit-ramp-checker] Evaluating pre-committed stop/pivot signals...');
    try {
      const activeRamps = await prisma.exitRamp.findMany({
        where: { status: 'MONITORING' },
        include: { goal: { include: { tasks: true } } },
      });

      for (const ramp of activeRamps) {
        if (ramp.signalType === 'SCHEDULE_SLIP_DAYS') {
          const now = new Date();
          const target = ramp.goal.targetDate;
          if (target && now > target) {
            const slipDays = Math.ceil((now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
            if (slipDays >= ramp.thresholdValue) {
              console.log(`[Exit Ramp Tripped] Goal "${ramp.goal.title}" slipped ${slipDays} days (threshold: ${ramp.thresholdValue}d)`);
              await prisma.exitRamp.update({
                where: { id: ramp.id },
                data: {
                  status: 'TRIGGERED',
                  triggeredAt: now,
                  evidenceJson: { slipDays, goalTitle: ramp.goal.title },
                },
              });
            }
          }
        }
      }
      return { checked: activeRamps.length };
    } catch (err: any) {
      console.warn(`[Queue: exit-ramp-checker] Notice: ${err.message}`);
      return { checked: 0 };
    }
  },
  { connection: redisConnection, concurrency: 2 },
);

// 3. Absence Autopilot Worker (Market Differentiator 1: 3 quiet days -> slide deadlines)
const absenceAutopilotWorker = new Worker(
  'absence-autopilot',
  async (job: Job) => {
    console.log('[Queue: absence-autopilot] Scanning for quiet workspaces (>= 3 days)...');
    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const dormantUsers = await prisma.userAbsenceState.findMany({
        where: {
          lastActiveAt: { lt: threeDaysAgo },
          isAutopilotActive: false,
        },
      });

      for (const userState of dormantUsers) {
        console.log(`[Absence Autopilot Activated] User ${userState.userId} inactive for 3+ days. Sliding deadlines +4 days...`);
        await prisma.userAbsenceState.update({
          where: { id: userState.id },
          data: {
            isAutopilotActive: true,
            autopilotStartedAt: new Date(),
            daysSlid: 4,
            pausedRecurrences: true,
          },
        });
      }
      return { processed: dormantUsers.length };
    } catch (err: any) {
      console.warn(`[Queue: absence-autopilot] Notice: ${err.message}`);
      return { processed: 0 };
    }
  },
  { connection: redisConnection, concurrency: 1 },
);

// 4. Legacy / Auxiliary Workers (Integration Sync, Tool Execution, Notification)
const integrationSyncWorker = new Worker(
  'integration-sync',
  async (job: Job) => {
    console.log(`[Queue: integration-sync] Syncing connection ${job.data.connectionId}`);
    return { synced: true };
  },
  { connection: redisConnection, concurrency: 5 },
);

const allWorkers = [
  agentRunWorker,
  exitRampWorker,
  absenceAutopilotWorker,
  integrationSyncWorker,
];

for (const worker of allWorkers) {
  worker.on('failed', (job, err) => {
    console.error(`[Worker error] Job ${job?.id} on queue ${worker.name} failed: ${err.message}`);
  });
  worker.on('error', (err) => {
    console.warn(`[BullMQ notice] ${worker.name} Redis status: ${err.message}`);
  });
}

console.log('[Worker Fleet] All BullMQ workers initialized successfully (agent-run [concurrency: 1], exit-ramp-checker, absence-autopilot, integration-sync).');

process.on('SIGTERM', async () => {
  console.log('[Worker Fleet] Gracefully shutting down workers...');
  for (const worker of allWorkers) {
    await worker.close();
  }
  await prisma.$disconnect();
  process.exit(0);
});
