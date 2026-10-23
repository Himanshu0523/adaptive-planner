# API Specification: Adaptive Planner REST API (v1)

Base URL: `http://localhost:3000/api/v1`  
Interactive Swagger OpenAPI Docs: `http://localhost:3000/api/docs`

---

## Endpoint Catalog

### 1. Health & Readiness (Non-prefixed)
- `GET /health/live`
  - Purpose: Process liveness probe.
  - Response: `{ "status": "ok", "uptime": 12.4, "timestamp": "..." }`
- `GET /health/ready`
  - Purpose: Dependency readiness probe (PostgreSQL & Redis).
  - Response: `{ "status": "ok", "services": { "database": "connected", "api": "running" } }`

---

### 2. Identity
- `GET /api/v1/me`
  - Purpose: Fetch current authenticated user and active workspace.
  - Headers: `Authorization: Bearer <token>` or `x-user-id`, `x-workspace-id`

---

### 3. Goals
- `POST /api/v1/goals`
  - Purpose: Create a new goal with optional milestones.
  - Body: `{ "title": "Pass AWS Cert", "goalType": "TIME_BOUND", "targetDate": "2026-12-01" }`
- `GET /api/v1/goals`
  - Purpose: List all goals in the active workspace.
- `GET /api/v1/goals/:id`
  - Purpose: Get goal details, version definitions, and milestones.
- `PATCH /api/v1/goals/:id`
  - Purpose: Update goal status or attributes.

---

### 4. Planning & AI Synthesis
- `POST /api/v1/plans/generate`
  - Purpose: Generate a proposed action plan using the Gemini Model Gateway.
  - Body: `{ "naturalLanguageIntent": "Prepare for technical interviews in 4 weeks", "availableHoursPerDay": 2 }`
  - Response: Structured plan with intent, assumptions, trade-offs, steps, and tool risk flags.
- `POST /api/v1/plans/:id/approve`
  - Purpose: Approve proposed plan and materialize steps into tasks in PostgreSQL.

---

### 5. Tasks
- `GET /api/v1/tasks/today`
  - Purpose: Get prioritized daily focus tasks for today.
- `GET /api/v1/tasks`
  - Purpose: List tasks (optional query params: `?status=TODO&goalId=...`).
- `POST /api/v1/tasks`
  - Purpose: Create an actionable task.
- `PATCH /api/v1/tasks/:id`
  - Purpose: Update status (`TODO` -> `IN_PROGRESS` -> `DONE`), estimate, or due date.

---

### 6. Personal AI Agent Runs
- `POST /api/v1/agent/runs`
  - Purpose: Start an autonomous agent run.
  - Body: `{ "prompt": "Schedule 2 deep work blocks for goal MVP" }`
- `GET /api/v1/agent/runs/:id`
  - Purpose: Poll agent run status, tool executions, and pending approvals.

---

### 7. Integrations & Catalog
- `GET /api/v1/integrations/catalog`
  - Purpose: Discover supported providers (`google_calendar`, `github`, `mcp`).
- `POST /api/v1/integrations/:provider/connect`
  - Purpose: Initiate OAuth authorization flow.
- `GET /api/v1/integrations`
  - Purpose: List connected external accounts for active workspace.
- `DELETE /api/v1/integrations/:id`
  - Purpose: Disconnect external provider and revoke tokens.

---

### 8. Human Approvals
- `GET /api/v1/approvals`
  - Purpose: List pending external or sensitive actions awaiting human confirmation.
- `POST /api/v1/approvals/:id/decision`
  - Purpose: Approve or reject action (`{ "decision": "APPROVE" }` or `{ "decision": "REJECT" }`).

---

### 9. Notifications & Reminders
- `GET /api/v1/notifications/preferences`
  - Purpose: Read reminder preferences and quiet hours.
- `PATCH /api/v1/notifications/preferences`
  - Purpose: Update notification delivery settings.

---

### 10. Webhooks
- `POST /api/v1/webhooks/:provider`
  - Purpose: Ingest inbound provider events with idempotency deduplication.
