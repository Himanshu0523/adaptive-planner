# Security & Reliability Specification

## 1. Tenant & Workspace Isolation
- **Server-Side Enforcement:** Every query touching database records enforces the authenticated `workspaceId`. The AI model is never allowed to provide or override the tenant context.
- **Role-Based Access Control:** Workspace members have assigned roles (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`). Administrative actions (disconnecting accounts, deleting goals) require `OWNER` or `ADMIN` roles.

---

## 2. Token Protection & Secret Management
- **Encryption at Rest:** OAuth refresh tokens and access tokens are encrypted with AES-256-GCM using `OAUTH_ENCRYPTION_KEY` prior to persisting in `integration_credentials`.
- **Zero Leakage to Frontend:** Raw tokens and secrets are stripped from all API response DTOs.
- **Fail-Closed Revocation:** Expired or revoked credentials transition connection status to `EXPIRED` or `REVOKED` and cancel pending retry jobs.

---

## 3. Human-in-the-Loop Risk Policy

| Risk Tier | Example Operation | Server Policy |
| :--- | :--- | :--- |
| **`READ_ONLY`** | Read Google Calendar availability, fetch GitHub issues | Auto-executed if OAuth scope is granted. |
| **`LOW_RISK_INTERNAL_WRITE`** | Create internal draft task, add milestone | Auto-executed within workspace boundaries. |
| **`EXTERNAL_WRITE`** | Create Google Calendar event, post GitHub issue | Requires human confirmation or explicit pre-approval. |
| **`SENSITIVE_ACTION`** | Send email, modify code repository, delete files | Mandatory human approval modal with diff inspection. |
| **`HIGH_IMPACT_ACTION`** | Irreversible account modification, financial charge | Blocked by default fail-closed policy. |

---

## 4. Prompt Injection Defense
- **Untrusted Input Classification:** Content fetched from external sources (calendar event descriptions, GitHub issue bodies, emails, webhooks) is marked as untrusted data.
- **Tool Privilege Separation:** Prompts cannot elevate permissions, invoke unauthorized tools, or skip human approval checkpoints.

---

## 5. Audit Trail & Compliance
- Every tool execution, approval decision, and workspace mutation is logged in `audit_events` with UTC timestamps, actor ID, action type, and tracing context.
