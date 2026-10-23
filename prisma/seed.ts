import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://app:local_dev_only@127.0.0.1:5432/personal_agent?schema=public';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Adaptive Planner development database...');

  // 1. Create Default User
  const defaultUser = await prisma.user.upsert({
    where: { email: 'user@adaptiveplanner.local' },
    update: {},
    create: {
      id: 'usr_dev_001',
      email: 'user@adaptiveplanner.local',
      displayName: 'Alex Planner',
      timezone: 'UTC',
    },
  });

  console.log(`User created or verified: ${defaultUser.id} (${defaultUser.email})`);

  // 2. Create Personal Workspace
  const personalWorkspace = await prisma.workspace.upsert({
    where: { id: 'ws_dev_personal_001' },
    update: {},
    create: {
      id: 'ws_dev_personal_001',
      name: "Alex's Personal Workspace",
      ownerUserId: defaultUser.id,
      members: {
        create: {
          userId: defaultUser.id,
          role: 'OWNER',
        },
      },
    },
  });

  console.log(`Workspace created or verified: ${personalWorkspace.id}`);

  // 3. Create Sample Goal
  const sampleGoal = await prisma.goal.create({
    data: {
      id: 'goal_dev_launch_mvp',
      workspaceId: personalWorkspace.id,
      title: 'Launch Personal AI Agent Platform MVP',
      description: 'Deploy goal-aware multi-tool personal AI agent backend with Next.js dashboard',
      goalType: 'MILESTONE_DRIVEN',
      status: 'ACTIVE',
      priority: 'HIGH',
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      versions: {
        create: {
          version: 1,
          definitionJson: {
            title: 'Launch Personal AI Agent Platform MVP',
            scope: ['NestJS API', 'Prisma Schema', 'Worker', 'Gemini AI Gateway'],
            constraints: ['Strict TypeScript', 'Modular monolith', 'No premature microservices'],
          },
          approvedAt: new Date(),
        },
      },
      milestones: {
        create: [
          {
            title: 'Foundation & Relational Database Layer',
            dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'IN_PROGRESS',
            orderIndex: 0,
          },
          {
            title: 'AI Planning Gateway & Execution Pipeline',
            dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            status: 'PENDING',
            orderIndex: 1,
          },
          {
            title: 'External Integrations & Calendar Sync',
            dueAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
            status: 'PENDING',
            orderIndex: 2,
          },
        ],
      },
    },
  });

  console.log(`Sample Goal created: ${sampleGoal.id} with milestones`);

  // 4. Create Sample Initial Tasks
  await prisma.task.createMany({
    data: [
      {
        workspaceId: personalWorkspace.id,
        goalId: sampleGoal.id,
        title: 'Initialize pnpm workspace and root dependencies',
        notes: 'Configure packages and shared contracts',
        status: 'DONE',
        estimatedMinutes: 25,
        completedAt: new Date(),
        priority: 'HIGH',
      },
      {
        workspaceId: personalWorkspace.id,
        goalId: sampleGoal.id,
        title: 'Verify Prisma database migration and seed data',
        notes: 'Ensure all 16 tables match architectural specification',
        status: 'IN_PROGRESS',
        estimatedMinutes: 30,
        dueAt: new Date(),
        priority: 'HIGH',
      },
      {
        workspaceId: personalWorkspace.id,
        goalId: sampleGoal.id,
        title: 'Test NestJS health endpoints and model gateway',
        notes: 'Check /health/live, /health/ready, and Gemini gateway connection',
        status: 'TODO',
        estimatedMinutes: 45,
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        priority: 'MEDIUM',
      },
    ],
  });

  // 5. Seed Initial User Memory
  await prisma.userMemory.create({
    data: {
      userId: defaultUser.id,
      workspaceId: personalWorkspace.id,
      memoryType: 'PREFERENCE',
      content: 'Prefers deep-work focus sessions in the morning between 09:00 and 12:00 UTC.',
      source: 'initial_onboarding',
      confidence: 0.95,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
