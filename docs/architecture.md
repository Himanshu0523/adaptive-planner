# Architecture Specification: Personal AI Agent Platform

## 1. System Overview

The **Personal AI Agent Platform** (`adaptive-planner`) is an AI-orchestrated planning companion designed around psychological safety, realistic capacity estimation, and proactive recovery. It connects a user's authorized productivity applications, understands high-level goals, coordinates tasks across providers, and adapts plans based on actual velocity.

### Core Architectural Decisions
- **Modular Monolith:** A unified TypeScript codebase housing the HTTP API (`apps/api`) and the background job processor (`apps/worker`), sharing contracts (`packages/contracts`), tool SDK (`packages/tool-sdk`), and database schemas (`prisma/`).
- **PostgreSQL 17 as System of Record:** Every critical business entity (goals, tasks, connections, approvals, audit logs) is stored relationally. JSONB is reserved strictly for provider payloads and model metadata.
- **Prisma ORM 7:** Type-safe database queries, declarative migrations, and relational integrity.
- **Redis 7 + BullMQ:** Asynchronous background job processing for plan synthesis, recurring schedule reconciliation, webhook ingestion, and resilient tool execution.
- **Provider-Independent AI Model Gateway:** An internal gateway abstraction (`IModelGateway`) defaulting to **Google Gemini** (`gemini-2.5-flash`), enforcing structured JSON schemas, timeouts, and fallback resilience.
- **Explicit Risk & Human-in-the-Loop Policies:** Model actions are segregated into 5 risk tiers. High-impact or sensitive operations require server-side human approval before execution.

---

## 2. Component Topology

```mermaid
graph TD
    subgraph Clients
        Web[Next.js Web Client :3001]
        Mobile[Mobile Client]
    end

    subgraph Backend [Modular Monolith]
        API[NestJS HTTP API :3000]
        Worker[BullMQ Worker Fleet]
        SDK[Shared Tool SDK & Contracts]
    end

    subgraph Infrastructure
        PG[(PostgreSQL 17)]
        Redis[(Redis 7)]
    end

    subgraph ExternalServices [External Integrations]
        Gemini[Google Gemini 2.5]
        GCal[Google Calendar API]
        GitHub[GitHub API]
        MCP[MCP Server Daemon]
    end

    Web -->|REST /api/v1| API
    Mobile -->|REST /api/v1| API

    API -->|Read / Write| PG
    API -->|Enqueue Jobs| Redis
    API -->|LLM Prompts & Schemas| Gemini

    Worker -->|Dequeue Jobs| Redis
    Worker -->|State Sync & Materialization| PG
    Worker -->|Sync & Execution| GCal
    Worker -->|Sync & Execution| GitHub
    Worker -->|Standardized Tools| MCP
```

---

## 3. Modular Monolith Directory Structure

```
adaptive-planner/
├── apps/
│   ├── api/                   # NestJS HTTP API
│   │   └── src/
│   │       ├── health/        # /health/live, /health/ready
│   │       ├── identity/      # /me, user & workspace auth
│   │       ├── goals/         # Goals CRUD & versioning
│   │       ├── tasks/         # Tasks CRUD & today focus
│   │       ├── planning/      # Proposed plan generation & approval
│   │       ├── agent/         # Model gateway (Gemini) & pipeline
│   │       ├── tools/         # Registry, risk policy & approvals
│   │       ├── integrations/  # Adapters (Google Calendar, GitHub, MCP)
│   │       ├── notifications/ # User preferences & scheduled reminders
│   │       ├── events/        # Webhook ingestion & deduplication
│   │       ├── audit/         # Immutable audit logging
│   │       └── memory/        # Preference & fact retention
│   ├── worker/                # BullMQ Worker Fleet
│   └── web/                   # Next.js Frontend Dashboard
├── packages/
│   ├── contracts/             # Shared DTOs, interfaces & enums
│   ├── tool-sdk/              # IntegrationAdapter & ToolDefinition
│   └── config/                # Environment validation & loading
├── prisma/
│   ├── schema.prisma          # 16 Relational models
│   └── seed.ts                # Development seed script
├── infra/
│   ├── docker/                # Multi-stage Dockerfiles
│   └── observability/         # OpenTelemetry setup
└── docs/                      # Architectural specifications
```

---

## 4. Execution Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant API as NestJS API
    participant Gemini as Gemini AI Gateway
    participant Policy as Tool Policy Service
    participant DB as PostgreSQL (Prisma)
    participant Redis as Redis / BullMQ

    User->>API: POST /api/v1/plans/generate (Goal intent)
    API->>DB: Fetch user context, memories, current goals
    API->>Gemini: generateStructuredPlan(intent, context, tools)
    Gemini-->>API: Structured Plan JSON (steps + risk levels)
    API-->>User: Proposed Plan Preview (with trade-offs)

    User->>API: POST /api/v1/plans/:id/approve
    API->>DB: Atomically persist Goal, GoalVersion, Tasks
    API->>Redis: Enqueue background synchronization
    API-->>User: Materialized confirmation
```
