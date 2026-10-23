# Integrations Specification: Adapter Architecture & Protocol Guidelines

## 1. Adapter Contract

All integration providers implement the `IntegrationAdapter` contract from `@adaptive-planner/tool-sdk`:

```typescript
export interface IntegrationAdapter {
  readonly providerId: string;
  readonly displayName: string;
  readonly description: string;
  listTools(): ToolDefinition[];
  execute(
    toolName: string,
    input: unknown,
    context: AuthorizedExecutionContext,
  ): Promise<ToolResult>;
  checkConnection(
    context: AuthorizedExecutionContext,
  ): Promise<ConnectionHealth>;
}
```

---

## 2. Supported Adapters

### Google Calendar (`google_calendar`)
- **Category:** Calendar & Scheduling
- **Scopes:** `calendar.events.readonly`, `calendar.events`
- **Exposed Tools:**
  - `google_calendar_list_events` (Risk: `READ_ONLY`)
  - `google_calendar_create_event` (Risk: `EXTERNAL_WRITE`)

### GitHub (`github`)
- **Category:** Developer & Project Tracking
- **Scopes:** `repo:read`, `repo:write`
- **Exposed Tools:**
  - `github_list_issues` (Risk: `READ_ONLY`)
  - `github_create_issue` (Risk: `EXTERNAL_WRITE`)

### Model Context Protocol (`mcp`)
- **Category:** Standardized Agent Tool Protocol
- **Scopes:** `mcp:read`, `mcp:write`
- **Exposed Tools:**
  - `mcp_search_knowledge` (Risk: `READ_ONLY`)

---

## 3. OAuth 2.0 Connection Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as Web Client
    participant Backend as NestJS API
    participant Provider as OAuth Provider (Google / GitHub)
    participant DB as PostgreSQL

    User->>Frontend: Click "Connect Google Calendar"
    Frontend->>Backend: POST /api/v1/integrations/google_calendar/connect
    Backend-->>Frontend: Authorization URL with cryptographically secure state
    Frontend->>Provider: Redirect to OAuth Consent Screen
    User->>Provider: Authorize requested scopes
    Provider-->>Backend: Redirect with code & state
    Backend->>Provider: Exchange authorization code for tokens
    Backend->>DB: Encrypt & persist credentials in integration_credentials
    Backend-->>Frontend: Redirect back with connection confirmed
```
