# Adaptive Planner 🌿

> **An AI-orchestrated, psychologically safe planning and goal execution platform.**  
> Built for engineers, knowledge workers, and high-agency individuals pursuing ambitious goals without cognitive overload, guilt-inducing streaks, or schedule drift.

[![Build & Tests](https://img.shields.io/badge/build-passing-2d5a43.svg)](https://github.com/Himanshu0523/adaptive-planner)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-61dafb.svg)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-E0234E.svg)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.1-2D3748.svg)](https://www.prisma.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-5.0-orange.svg)](https://bullmq.io/)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Himanshu0523/adaptive-planner&root-directory=apps/web)


### 🌐 Live Production Deployments
- **Vercel (Primary):** [https://planner-app-liart.vercel.app](https://planner-app-liart.vercel.app/)
<!-- - **Netlify (Mirror):** [https://personalplannerapp.netlify.app](https://personalplannerapp.netlify.app/) -->

> **Demo Login:** `demo@adaptiveplanner.io` / `password123` (or register any new account)

---

## 🎯 What Makes Adaptive Planner Different?

Most productivity apps act as passive task lists or punitive streak trackers that shame you when life happens. **Adaptive Planner** answers five essential questions with evidence-based diagnostics and calm recovery:

1. **What am I trying to achieve?** — Phased milestone roadmaps with measurable criteria.
2. **What should I do today?** — Bite-sized, 20–60 minute focus blocks with built-in transition pauses.
3. **Am I making real progress?** — Transparent milestone tracking and velocity metrics.
4. **Why is my plan not working?** — Evidence-based diagnostics separating verifiable facts from hypotheses.
5. **How can I recover without feeling like I have failed?** — Decision-based schedule recalibration with 3 sustainable recovery paths.

---

## 🏗️ Architecture & Monorepo Topology

```
adaptive-planner/
├── apps/
│   ├── web/                   # Next.js 16 (React 19, Turbopack, Tailwind CSS, TanStack Query)
│   ├── api/                   # NestJS 10 HTTP API (Swagger, Model Gateway, Prisma, Audit)
│   └── worker/                # BullMQ Worker Fleet (6 Queues: Planning, Sync, Webhooks, etc.)
├── packages/
│   ├── contracts/             # Shared TypeScript DTOs, schemas & interfaces
│   ├── tool-sdk/              # Standardized Tool Definition & Integration Adapters
│   └── config/                # Environment validation & loading
├── prisma/
│   ├── schema.prisma          # Relational PostgreSQL 17 schema (16 models)
│   └── seed.ts                # Development database seed script
└── docs/                      # Architectural specifications & API documentation
```

---

## ✨ Key Features

- **Guided AI Goal Intake**: Natural language decomposition grounded in weekly availability and constraints.
- **Dynamic Phasing**: Phase 1 tasks start immediately today; subsequent phases space realistically across weeks.
- **Daily Focus Workspace (`/today`)**: Active live focus session timer, blocker capture, and completion reflections.
- **Weekly Capacity Planning (`/planner`)**: Conflict detection and 15% focus compression buffers.
- **Calm Recovery Simulator (`/recovery`)**:
  - *Option 1*: Keep deadline and defer non-essential items to Phase 2.
  - *Option 2*: Extend deadline gently (+4 days) without compromising scope.
  - *Option 3*: Reallocate workload to weekend/evening buffer blocks.
- **Full Authentication**: Email/password authentication, JWT verification, session guards, and 1-click Instant Demo Access.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.x
- pnpm >= 9.x
- (Optional) Docker for PostgreSQL and Redis

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/Himanshu0523/adaptive-planner.git
cd adaptive-planner

# Install all dependencies across monorepo
pnpm install
```

### 2. Environment Setup

```bash
# Copy example environment configuration
cp .env.example .env
```

### 3. Run Development Servers

```bash
# Run Next.js Web Dashboard (:3001)
pnpm dev:web

# Run NestJS HTTP API (:3000)
pnpm dev:api

# Run BullMQ Worker Fleet
pnpm dev:worker

# Or run API + Worker in parallel
pnpm dev:all
```

### 4. Build & Test

```bash
# Run unit & integration test suites
pnpm test

# Build all packages and applications for production
pnpm build:all
```

---

## 🔑 Default Test Credentials

| Access Type | Email | Password |
| :--- | :--- | :--- |
| **Email Sign In** | `demo@adaptiveplanner.io` | `password123` |
| **Instant Guest** | Click **"Instant Demo / Guest Access"** on `/login` | *No password required* |

---

## 📄 License

MIT © [Himanshu Satpute](https://github.com/Himanshu0523)
