# Stage 1: Campus Notification Platform - REST API Contracts & System Design

## 1) Scope and Business Goal
Build a notification platform that delivers timely, real-time campus updates to students for:
- placements
- events
- exam_results
- announcements

Users are pre-authenticated by an upstream identity layer. This service focuses only on notification creation, delivery, read-state tracking, preferences, and sync.

## 2) API Naming Conventions
- Base path: `/v1`
- Resource-first routes: plural nouns (`/notifications`, `/notification-preferences`)
- State transitions via sub-resources or action endpoints:
  - `/notifications/{notificationId}/read`
  - `/notifications/read-all`
- Filter/query semantics in query params
- `camelCase` JSON fields
- UTC ISO-8601 timestamps

## 3) Architecture Overview
### 3.1 Logical Components
- **API Gateway (existing)**: authentication and request forwarding
- **Notification API (Node.js/Express)**:
  - route layer
  - controller/handler layer
  - service/domain layer
  - repository layer
- **Primary DB**: notification records, read-state, preferences
- **Cache (Redis)**: unread count cache, short-lived cursor/session state
- **Message Broker (lightweight queue/topic)**: async fan-out and retry workflow
- **Realtime Gateway (WebSocket)**: live push to active clients
- **Worker/Cron**: retry undelivered realtime attempts, cleanup jobs

### 3.2 Why WebSocket (vs SSE)
WebSocket is preferred because:
- bi-directional channel supports client acks
- reconnect resume with last cursor is straightforward
- lower overhead for frequent campus bursts (placement/event windows)
- supports heartbeat and session freshness checks

## 4) Data Contracts (JSON Schemas)

## 4.1 Notification Schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Notification",
  "type": "object",
  "required": [
    "notificationId",
    "category",
    "title",
    "message",
    "priority",
    "deliveryTimestamp",
    "isRead",
    "createdBy",
    "metadata"
  ],
  "properties": {
    "notificationId": { "type": "string", "minLength": 12, "maxLength": 64 },
    "category": {
      "type": "string",
      "enum": ["placements", "events", "exam_results", "announcements"]
    },
    "title": { "type": "string", "minLength": 3, "maxLength": 140 },
    "message": { "type": "string", "minLength": 1, "maxLength": 2000 },
    "priority": { "type": "string", "enum": ["low", "normal", "high", "critical"] },
    "deliveryTimestamp": { "type": "string", "format": "date-time" },
    "isRead": { "type": "boolean" },
    "readAt": { "type": ["string", "null"], "format": "date-time" },
    "createdBy": {
      "type": "object",
      "required": ["actorId", "actorType"],
      "properties": {
        "actorId": { "type": "string", "minLength": 3, "maxLength": 64 },
        "actorType": { "type": "string", "enum": ["admin", "system"] }
      }
    },
    "metadata": {
      "type": "object",
      "additionalProperties": true,
      "properties": {
        "targetAudience": { "type": "string" },
        "placementDriveId": { "type": "string" },
        "eventId": { "type": "string" },
        "examSessionId": { "type": "string" },
        "actionUrl": { "type": "string", "format": "uri" }
      }
    }
  }
}
```

## 4.2 Create Notification Request Schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "CreateNotificationRequest",
  "type": "object",
  "required": ["category", "title", "message", "priority", "audience", "metadata"],
  "properties": {
    "category": { "type": "string", "enum": ["placements", "events", "exam_results", "announcements"] },
    "title": { "type": "string", "minLength": 3, "maxLength": 140 },
    "message": { "type": "string", "minLength": 1, "maxLength": 2000 },
    "priority": { "type": "string", "enum": ["low", "normal", "high", "critical"] },
    "audience": {
      "type": "object",
      "required": ["scope"],
      "properties": {
        "scope": { "type": "string", "enum": ["all_students", "department", "batch", "custom_list"] },
        "department": { "type": "string" },
        "batchYear": { "type": "integer", "minimum": 2000, "maximum": 2100 },
        "studentIds": { "type": "array", "items": { "type": "string" }, "maxItems": 1000 }
      }
    },
    "metadata": { "type": "object", "additionalProperties": true },
    "scheduledAt": { "type": ["string", "null"], "format": "date-time" }
  }
}
```

## 4.3 Notification Preferences Schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "NotificationPreferences",
  "type": "object",
  "required": ["studentId", "categories", "muteUntil"],
  "properties": {
    "studentId": { "type": "string" },
    "categories": {
      "type": "object",
      "required": ["placements", "events", "exam_results", "announcements"],
      "properties": {
        "placements": { "type": "boolean" },
        "events": { "type": "boolean" },
        "exam_results": { "type": "boolean" },
        "announcements": { "type": "boolean" }
      }
    },
    "muteUntil": { "type": ["string", "null"], "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  }
}
```

## 4.4 Error Response Schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "ApiError",
  "type": "object",
  "required": ["error"],
  "properties": {
    "error": {
      "type": "object",
      "required": ["code", "message", "traceId", "timestamp", "retryable"],
      "properties": {
        "code": { "type": "string" },
        "message": { "type": "string" },
        "traceId": { "type": "string" },
        "timestamp": { "type": "string", "format": "date-time" },
        "retryable": { "type": "boolean" },
        "details": { "type": "array", "items": { "type": "object" } }
      }
    }
  }
}
```

## 5) Common Request/Response Conventions

### 5.1 Required Headers
- `Authorization: Bearer <token>` (from upstream auth)
- `X-Request-Id: <uuid>` (traceability)
- `Accept: application/json`
- `Content-Type: application/json` (for write operations)

### 5.2 Optional Headers
- `X-Idempotency-Key: <uuid>` (required for `POST /notifications` in production)
- `If-None-Match: <etag>` (optional for cache-aware fetch)

### 5.3 Standard Success Envelope
```json
{
  "data": {},
  "meta": {
    "requestId": "7b2f2a0e-a28e-458e-977e-7d8fcd4043e4",
    "timestamp": "2026-05-16T09:20:00Z"
  }
}
```

## 6) REST API Contracts

## 6.1 Fetch Notifications
- **Method**: `GET`
- **Route**: `/v1/notifications`
- **Purpose**: paginated feed with filters and deterministic ordering
- **Query Params**:
  - `cursor` (optional, opaque)
  - `limit` (optional, default `20`, max `100`)
  - `category` (`placements|events|exam_results|announcements`)
  - `isRead` (`true|false`)
  - `priority` (`low|normal|high|critical`)
  - `from` / `to` (ISO timestamps)
- **Response 200**:
```json
{
  "data": {
    "items": [
      {
        "notificationId": "ntf_01J7S8YVYF5M8S7T1JZ",
        "category": "placements",
        "title": "Drive shortlist published",
        "message": "Shortlisted candidates can view details in portal.",
        "priority": "high",
        "deliveryTimestamp": "2026-05-16T08:45:00Z",
        "isRead": false,
        "readAt": null,
        "createdBy": { "actorId": "admin_224", "actorType": "admin" },
        "metadata": { "placementDriveId": "drv_993", "actionUrl": "https://campus.example.edu/drives/drv_993" }
      }
    ]
  },
  "meta": {
    "nextCursor": "eyJvZmZzZXQiOjIwLCJ0cyI6IjIwMjYtMDUtMTZUMDg6NDU6MDBaIn0",
    "hasMore": true,
    "requestId": "c6a4f39a-9516-4bf4-8449-3905f0b4bc9e",
    "timestamp": "2026-05-16T09:20:00Z"
  }
}
```
- **Status Codes**: `200, 400, 401, 403, 429, 500`

## 6.2 Fetch Unread Count
- **Method**: `GET`
- **Route**: `/v1/notifications/unread-count`
- **Purpose**: lightweight unread badge count
- **Response 200**:
```json
{
  "data": {
    "unreadCount": 17,
    "lastComputedAt": "2026-05-16T09:19:30Z"
  },
  "meta": {
    "requestId": "f40136aa-1ba0-49da-8850-6f9ee696f6e8",
    "timestamp": "2026-05-16T09:20:00Z"
  }
}
```
- **Status Codes**: `200, 401, 429, 500`

## 6.3 Mark Single Notification as Read
- **Method**: `PATCH`
- **Route**: `/v1/notifications/{notificationId}/read`
- **Purpose**: idempotently mark one notification as read
- **Request Body** (optional explicit state):
```json
{
  "isRead": true
}
```
- **Response 200**:
```json
{
  "data": {
    "notificationId": "ntf_01J7S8YVYF5M8S7T1JZ",
    "isRead": true,
    "readAt": "2026-05-16T09:21:12Z"
  },
  "meta": {
    "requestId": "4d08be71-58ef-4d08-a055-bff0478f31db",
    "timestamp": "2026-05-16T09:21:12Z"
  }
}
```
- **Status Codes**: `200, 400, 401, 403, 404, 409, 429, 500`

## 6.4 Mark All as Read
- **Method**: `PATCH`
- **Route**: `/v1/notifications/read-all`
- **Purpose**: mark all unread notifications as read for current user
- **Request Body**:
```json
{
  "upToTimestamp": "2026-05-16T09:21:12Z"
}
```
- **Response 200**:
```json
{
  "data": {
    "updatedCount": 42,
    "readAt": "2026-05-16T09:22:00Z"
  },
  "meta": {
    "requestId": "5f8d2139-2f83-4f53-9da3-59eb6280f6ce",
    "timestamp": "2026-05-16T09:22:00Z"
  }
}
```
- **Status Codes**: `200, 400, 401, 429, 500`

## 6.5 Create Notification
- **Method**: `POST`
- **Route**: `/v1/notifications`
- **Purpose**: create and fan-out a new notification to audience
- **Headers**:
  - `X-Idempotency-Key` required
- **Request Body**: `CreateNotificationRequest` schema
- **Response 201**:
```json
{
  "data": {
    "notificationId": "ntf_01J7SB52Q0N7R8X0K2K",
    "deliveryState": "queued",
    "queuedAt": "2026-05-16T09:23:00Z"
  },
  "meta": {
    "requestId": "2cb03373-32d0-479c-9d0c-3039861470e5",
    "timestamp": "2026-05-16T09:23:00Z"
  }
}
```
- **Status Codes**: `201, 400, 401, 403, 409, 429, 500, 503`

## 6.6 Get Notification Preferences
- **Method**: `GET`
- **Route**: `/v1/notification-preferences`
- **Purpose**: fetch current student preference settings
- **Response 200**:
```json
{
  "data": {
    "studentId": "std_10221",
    "categories": {
      "placements": true,
      "events": true,
      "exam_results": true,
      "announcements": false
    },
    "muteUntil": null,
    "updatedAt": "2026-05-15T16:20:00Z"
  },
  "meta": {
    "requestId": "f96e9513-b48f-4673-b10a-f5f19a3419fb",
    "timestamp": "2026-05-16T09:24:00Z"
  }
}
```
- **Status Codes**: `200, 401, 429, 500`

## 6.7 Update Notification Preferences
- **Method**: `PUT`
- **Route**: `/v1/notification-preferences`
- **Purpose**: update category toggles and mute window
- **Request Body**:
```json
{
  "categories": {
    "placements": true,
    "events": false,
    "exam_results": true,
    "announcements": true
  },
  "muteUntil": "2026-05-16T14:00:00Z"
}
```
- **Response 200**:
```json
{
  "data": {
    "updated": true,
    "updatedAt": "2026-05-16T09:25:00Z"
  },
  "meta": {
    "requestId": "6f9ad5d8-c2a6-4bfd-88e2-7cdf584f2fcb",
    "timestamp": "2026-05-16T09:25:00Z"
  }
}
```
- **Status Codes**: `200, 400, 401, 429, 500`

## 6.8 Missed Notification Sync
- **Method**: `GET`
- **Route**: `/v1/realtime/sync`
- **Purpose**: fetch missed notifications after reconnect/disconnect
- **Query Params**:
  - `sinceCursor` (required, last acknowledged cursor/eventId)
  - `limit` (optional, default `50`, max `200`)
- **Response 200**:
```json
{
  "data": {
    "items": [],
    "nextCursor": "evt_184400302",
    "syncComplete": true
  },
  "meta": {
    "requestId": "f3057138-b432-42cd-8892-a1554444b7ae",
    "timestamp": "2026-05-16T09:26:00Z"
  }
}
```
- **Status Codes**: `200, 400, 401, 429, 500`

## 6.9 Health/Status
- **Method**: `GET`
- **Route**: `/v1/health/status`
- **Purpose**: service health and dependency snapshot
- **Response 200**:
```json
{
  "data": {
    "status": "ok",
    "version": "1.0.0",
    "dependencies": {
      "db": "ok",
      "cache": "ok",
      "realtimeGateway": "ok"
    }
  },
  "meta": {
    "requestId": "69530d0f-5edf-4bd8-9d98-d22e2c1f1512",
    "timestamp": "2026-05-16T09:27:00Z"
  }
}
```
- **Status Codes**: `200, 503`

## 7) Standard Error Handling

## 7.1 Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Invalid request payload",
    "traceId": "af072d2f-1d3a-4f9d-a959-2a5b9d2153ba",
    "timestamp": "2026-05-16T09:28:00Z",
    "retryable": false,
    "details": [
      { "field": "priority", "issue": "must be one of low|normal|high|critical" }
    ]
  }
}
```

## 7.2 Common Error Codes
- `VALIDATION_FAILED` -> `400`
- `UNAUTHORIZED` -> `401`
- `FORBIDDEN` -> `403`
- `NOT_FOUND` -> `404`
- `CONFLICT` -> `409` (duplicate idempotency key, stale update)
- `RATE_LIMITED` -> `429` (include `Retry-After`)
- `INTERNAL_ERROR` -> `500`
- `SERVICE_UNAVAILABLE` -> `503`

## 8) Real-time Notification Strategy

## 8.1 WebSocket Endpoint
- **Endpoint**: `wss://<host>/v1/realtime/notifications`
- **Auth**: bearer token during handshake
- **Client hello payload** includes `lastSeenCursor` for resume

## 8.2 Server Events
- `notification.created`
- `notification.read.updated`
- `notification.badge.updated`
- `realtime.ping`

## 8.3 Reconnect Handling
- Client sends `lastSeenCursor` on reconnect
- Server replays missed events from persistent event store
- If gap exceeds retention window, server instructs client to call `/v1/realtime/sync`

## 8.4 Missed Notification Sync
- Sync endpoint is source of truth for recovery
- Cursor progression is monotonic and user-scoped
- Client persists latest acked cursor in local storage/state

## 9) Notification Lifecycle and Flow

## 9.1 Creation to Delivery
1. Admin/system calls `POST /v1/notifications` with idempotency key.
2. API validates payload, resolves audience, persists notification.
3. Service publishes delivery tasks to broker.
4. Worker fan-outs to user notification rows and pushes realtime event.
5. Active clients receive WebSocket event; inactive users read later via `GET /notifications`.

## 9.2 Read-state Flow
1. Client calls single/bulk read endpoint.
2. API updates read-state and unread cache atomically (transaction boundary).
3. Realtime badge update event sent to active sessions.

## 10) Priority and Delivery Rules
- `critical`: immediate delivery, bypass digest batching, higher retry budget
- `high`: immediate delivery, normal retry budget
- `normal`: standard queue
- `low`: can be batch-delivered to reduce burst load

Ordering inside feed:
1. unread first
2. higher priority first
3. newer `deliveryTimestamp` first

## 11) Scalability Decisions
- Stateless API instances behind load balancer
- DB indexes:
  - `(student_id, is_read, delivery_timestamp desc)`
  - `(category, delivery_timestamp desc)`
- Cursor-based pagination (avoid deep offset scans)
- Redis cache for unread count and hot feed windows
- WebSocket horizontal scaling via pub/sub adapter
- Backpressure controls:
  - per-user event queue caps
  - server-side rate limiting
  - payload size limits

## 12) Reliability Decisions
- Idempotent create endpoint via `X-Idempotency-Key`
- Retry with exponential backoff for realtime push and worker tasks
- Dead-letter queue for repeated failures (`maxAttempts` reached)
- Graceful degradation:
  - if WebSocket unavailable, API pull still works
  - if cache unavailable, fallback to DB count
- Traceability with `X-Request-Id` propagated across route/service/repository layers

## 13) Validation Rules (Key Checks)
- category and priority must be enum values
- title/message length enforced
- audience shape must match selected scope
- `muteUntil` cannot be in the past on write
- `upToTimestamp` cannot be future timestamp beyond allowed skew
- `limit` clamped to max bounds

## 14) Logging and Observability Contract
All meaningful operations use centralized logging middleware utility:
- `Log(stack, level, package, message)`

Examples of required log intents:
- Route entry/exit (`stack=backend`, `package=route`, `level=info`)
- Validation errors (`backend`, `handler`, `warn`)
- Delivery fan-out attempts (`backend`, `service`, `info`)
- Retry attempts and DLQ transitions (`backend`, `cron_job`, `warn/error`)
- DB/cache failures (`backend`, `db|cache`, `error`)
- Frontend reconnect/sync behavior (`frontend`, `hook|api|state`, `info/warn`)

No direct `console.log` usage in service components.

## 15) Frontend Integration Flow (React + TypeScript)
- On app load:
  - fetch unread count
  - fetch first notifications page
  - establish WebSocket with `lastSeenCursor`
- On realtime event:
  - prepend notification in local state
  - increment unread if not already read
- On reconnect:
  - call `/v1/realtime/sync?sinceCursor=...`
  - merge deduplicated notifications by `notificationId`
- On read actions:
  - optimistic UI update with rollback on API failure

## 16) Minimal Endpoint Summary
- `GET /v1/notifications`
- `GET /v1/notifications/unread-count`
- `PATCH /v1/notifications/{notificationId}/read`
- `PATCH /v1/notifications/read-all`
- `POST /v1/notifications`
- `GET /v1/notification-preferences`
- `PUT /v1/notification-preferences`
- `GET /v1/realtime/sync`
- `GET /v1/health/status`

---

## Stage 2: Persistent Database Design and Scaling Plan

### 2.1 Database Recommendation
**Recommendation: PostgreSQL as primary store + Redis cache + queue-backed async delivery.**

Why this fits the workload:
- Notification write pattern is bursty (fanout spikes), but read pattern is steady (feed, unread count, read actions). This is a good fit for relational storage with selective caching.
- Query patterns are predictable: filter by `student_id`, `is_read`, `category`, ordered by delivery time. PostgreSQL handles this well with composite and partial indexes.
- Reliability requirements (read-state correctness, idempotent create, retry bookkeeping) need transactional semantics.
- Realtime delivery does not require DB-native pub/sub as source of truth; queue + WebSocket gateway decouples push from persistence.
- JSONB support is enough for flexible metadata without forcing schema churn.
- Analytics can be handled with materialized rollups or warehouse export later; OLTP schema remains clean.

### 2.2 Schema Design (PostgreSQL)

```sql
-- enums
CREATE TYPE notification_priority AS ENUM ('low', 'normal', 'high', 'critical');
CREATE TYPE delivery_state AS ENUM ('queued', 'delivered', 'failed', 'expired');
CREATE TYPE audience_scope AS ENUM ('all_students', 'department', 'batch', 'custom_list');
CREATE TYPE notification_type AS ENUM ('Event', 'Result', 'Placement', 'Announcement');

-- students/users
CREATE TABLE campus_students (
  student_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  external_user_ref VARCHAR(64) NOT NULL UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  department_code VARCHAR(24) NOT NULL,
  batch_year SMALLINT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- notification template (one row per announcement)
CREATE TABLE notifications (
  notification_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  notification_type notification_type NOT NULL,
  priority notification_priority NOT NULL DEFAULT 'normal',
  title VARCHAR(140) NOT NULL,
  message TEXT NOT NULL,
  audience_scope audience_scope NOT NULL,
  created_by VARCHAR(64) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  scheduled_at TIMESTAMPTZ NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL, -- soft delete
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- per-student delivery/read state
CREATE TABLE notification_delivery_status (
  delivery_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  notification_id BIGINT NOT NULL REFERENCES notifications(notification_id),
  student_id BIGINT NOT NULL REFERENCES campus_students(student_id),
  delivery_state delivery_state NOT NULL DEFAULT 'queued',
  delivery_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ NULL,
  hidden_at TIMESTAMPTZ NULL, -- student-level soft hide
  retry_count SMALLINT NOT NULL DEFAULT 0,
  last_error_code VARCHAR(40) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (notification_id, student_id)
);

-- preferences
CREATE TABLE notification_preferences (
  student_id BIGINT PRIMARY KEY REFERENCES campus_students(student_id),
  placements_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  events_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  results_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  announcements_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  mute_until TIMESTAMPTZ NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- optional extracted metadata for high-frequency filters
CREATE TABLE notification_metadata (
  notification_id BIGINT NOT NULL REFERENCES notifications(notification_id),
  meta_key VARCHAR(64) NOT NULL,
  meta_value_text VARCHAR(256) NULL,
  meta_value_number NUMERIC(18,4) NULL,
  PRIMARY KEY (notification_id, meta_key)
);
```

### 2.3 Indexing Strategy
```sql
-- unread feed path
CREATE INDEX idx_delivery_unread_student_ts
ON notification_delivery_status (student_id, delivery_timestamp DESC, delivery_id DESC)
WHERE is_read = FALSE AND hidden_at IS NULL;

-- full history path
CREATE INDEX idx_delivery_student_ts
ON notification_delivery_status (student_id, delivery_timestamp DESC, delivery_id DESC);

-- join/fanout path
CREATE INDEX idx_delivery_notification_student
ON notification_delivery_status (notification_id, student_id);

-- category/type filtering + recent scans
CREATE INDEX idx_notifications_type_published
ON notifications (notification_type, published_at DESC, notification_id);

-- metadata filtering
CREATE INDEX idx_notifications_metadata_gin
ON notifications USING GIN (metadata);

-- operational monitoring
CREATE INDEX idx_delivery_state_retry
ON notification_delivery_status (delivery_state, retry_count, updated_at);
```

### 2.4 Read Tracking and Soft Delete Strategy
- Global delete is soft (`notifications.deleted_at`) to preserve audit and avoid broken recipient references.
- User-level removal uses `hidden_at`, not hard delete.
- Read state stays in `notification_delivery_status` with `is_read/read_at`.
- Hard delete happens only in archive jobs after retention cutoff.

### 2.5 Scaling Concerns at Higher Volume
- Unread scan cost grows when per-student delivery rows get large.
- Sorting by timestamp becomes expensive without index-aligned pagination.
- Joining `notifications` and `notification_delivery_status` on wide result sets increases buffer churn.
- Fanout causes write amplification: one publish can create thousands of recipient rows.
- Realtime spikes create contention between API reads and delivery writes.
- Offset pagination degrades badly on deep pages.
- Archival becomes painful if hot and cold data are mixed in one table.

### 2.6 Scaling Solutions
- Use partial unread index (small, selective) for the critical unread path.
- Keep cursor pagination (`delivery_timestamp`, `delivery_id`) and avoid offsets.
- Partition `notification_delivery_status` monthly by `delivery_timestamp` once growth justifies it.
- Cache unread count in Redis; reconcile with DB on misses or drift checks.
- Keep fanout async via queue workers; API only persists notification + enqueue intent.
- Use connection pooling and bounded worker concurrency.
- Move aged rows to archive tables (`*_archive`) with scheduled jobs.
- Instrument slow query and retry paths using centralized logger:
  - `Log('backend','warn','db','unread query crossed latency threshold')`
  - `Log('backend','error','service','delivery fanout batch failed after retry')`

### 2.7 Production Queries (Aligned with Stage 1 APIs)

**Fetch unread notifications (`GET /v1/notifications?isRead=false`)**
```sql
SELECT
  ds.delivery_id AS cursor_id,
  ds.student_id,
  ds.is_read,
  ds.read_at,
  ds.delivery_timestamp,
  n.notification_id,
  n.notification_type,
  n.priority,
  n.title,
  n.message,
  n.metadata,
  n.published_at
FROM notification_delivery_status ds
JOIN notifications n ON n.notification_id = ds.notification_id
WHERE ds.student_id = $1
  AND ds.is_read = FALSE
  AND ds.hidden_at IS NULL
  AND n.deleted_at IS NULL
  AND ($2::timestamptz IS NULL OR (ds.delivery_timestamp, ds.delivery_id) < ($2, $3))
ORDER BY ds.delivery_timestamp DESC, ds.delivery_id DESC
LIMIT $4;
```

**Mark notification as read (`PATCH /v1/notifications/{id}/read`)**
```sql
UPDATE notification_delivery_status
SET is_read = TRUE,
    read_at = NOW(),
    updated_at = NOW()
WHERE student_id = $1
  AND notification_id = $2
  AND is_read = FALSE
RETURNING delivery_id, notification_id, is_read, read_at;
```

**Fetch notification history (`GET /v1/notifications`)**
```sql
SELECT
  ds.delivery_id AS cursor_id,
  n.notification_id,
  n.notification_type,
  n.priority,
  n.title,
  n.message,
  ds.is_read,
  ds.read_at,
  ds.delivery_timestamp
FROM notification_delivery_status ds
JOIN notifications n ON n.notification_id = ds.notification_id
WHERE ds.student_id = $1
  AND ds.hidden_at IS NULL
  AND n.deleted_at IS NULL
  AND ($2::notification_type IS NULL OR n.notification_type = $2)
  AND ($3::boolean IS NULL OR ds.is_read = $3)
ORDER BY ds.delivery_timestamp DESC, ds.delivery_id DESC
LIMIT $4;
```

**Unread count (`GET /v1/notifications/unread-count`)**
```sql
SELECT COUNT(*)::BIGINT AS unread_count
FROM notification_delivery_status
WHERE student_id = $1
  AND is_read = FALSE
  AND hidden_at IS NULL;
```

**Create notification (`POST /v1/notifications`)**
```sql
INSERT INTO notifications (
  notification_type, priority, title, message,
  audience_scope, created_by, metadata, scheduled_at, published_at
) VALUES (
  $1, $2, $3, $4,
  $5, $6, $7::jsonb, $8, COALESCE($9, NOW())
)
RETURNING notification_id, published_at;
```

**Fetch notifications by category/type**
```sql
SELECT notification_id, notification_type, priority, title, published_at
FROM notifications
WHERE notification_type = $1
  AND deleted_at IS NULL
ORDER BY published_at DESC, notification_id DESC
LIMIT $2;
```

**Bulk delivery insertion (fanout)**
```sql
INSERT INTO notification_delivery_status (
  notification_id, student_id, delivery_state, delivery_timestamp, created_at, updated_at
)
SELECT
  $1,
  s.student_id,
  'queued',
  COALESCE($2, NOW()),
  NOW(),
  NOW()
FROM campus_students s
WHERE s.is_active = TRUE
  AND ($3::text IS NULL OR s.department_code = $3)
  AND ($4::smallint IS NULL OR s.batch_year = $4)
ON CONFLICT (notification_id, student_id) DO NOTHING;
```

**Archive cleanup job**
```sql
WITH moved_rows AS (
  DELETE FROM notification_delivery_status
  WHERE delivery_timestamp < NOW() - INTERVAL '180 days'
  RETURNING *
)
INSERT INTO notification_delivery_status_archive
SELECT * FROM moved_rows;
```

---

## Stage 3: Query Performance Analysis and Optimization

### 3.1 Given Query
```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

### 3.2 Is This Query Accurate?
Not in the current model. `notifications` is the template table; read-state is recipient-specific and belongs in `notification_delivery_status`.
Also, `ORDER BY createdAt ASC` returns oldest first, which is rarely what the notification feed needs.

### 3.3 Why It Slows Down at 50,000 Students / 5,000,000 Notifications
- Without a matching index, planner falls back to a full scan or a wide bitmap plan.
- `SELECT *` increases heap reads even if only a few columns are needed.
- Sorting cost is significant when many unread rows are returned; sort can spill to disk.
- If `isRead=false` is common, index on `isRead` alone has poor selectivity.
- Memory pressure increases when sort/hash operations run on large intermediate sets.
- High fanout writes make frequent index updates expensive; too many indexes worsen it.

### 3.4 Computational Cost Considerations
- Full scan path approaches `O(N)` on row count.
- Scan + explicit sort tends toward `O(K log K)` where `K` is matched rows.
- Index range scan on `(student_id, is_read, delivery_timestamp)` is near `O(log N + M)` where `M` is returned rows.
- Offset pagination adds linear skip cost; cursor pagination avoids that skip cost.

### 3.5 Should Every Column Be Indexed?
No. Indexing every column is usually a net loss:
- write overhead on insert/update (fanout-heavy workload amplifies this)
- larger storage and cache footprint
- more VACUUM/maintenance work
- planner confusion when many low-value indexes exist

### 3.6 Better Indexing Strategy
Use a small set of workload-driven indexes:
```sql
-- critical unread path
CREATE INDEX idx_delivery_unread_student_ts
ON notification_delivery_status (student_id, delivery_timestamp DESC, delivery_id DESC)
WHERE is_read = FALSE AND hidden_at IS NULL;

-- general history path
CREATE INDEX idx_delivery_student_ts
ON notification_delivery_status (student_id, delivery_timestamp DESC, delivery_id DESC);

-- join efficiency
CREATE INDEX idx_delivery_notification
ON notification_delivery_status (notification_id, student_id);

CREATE INDEX idx_notifications_id_type_time
ON notifications (notification_id, notification_type, published_at DESC);
```
Reasoning:
- Leading column `student_id` has high cardinality and strong pruning power.
- Partial unread index keeps hot index compact and selective.
- Timestamp + delivery id supports stable cursor pagination with no extra sort.

### 3.7 Optimized Query for Unread Feed
```sql
SELECT
  ds.delivery_id,
  ds.student_id,
  ds.delivery_timestamp,
  ds.is_read,
  ds.read_at,
  n.notification_id,
  n.notification_type,
  n.priority,
  n.title,
  n.message,
  n.metadata
FROM notification_delivery_status ds
JOIN notifications n ON n.notification_id = ds.notification_id
WHERE ds.student_id = $1
  AND ds.is_read = FALSE
  AND ds.hidden_at IS NULL
  AND n.deleted_at IS NULL
  AND ($2::timestamptz IS NULL OR (ds.delivery_timestamp, ds.delivery_id) < ($2, $3))
ORDER BY ds.delivery_timestamp DESC, ds.delivery_id DESC
LIMIT $4;
```

Operational logging around this query should be centralized:
- `Log('backend','debug','repository','fetch unread notifications query executed')`
- `Log('backend','warn','db','unread query exceeded p95 latency')`

### 3.8 Query: Students Who Received “Placement” in Last 7 Days
```sql
SELECT DISTINCT ds.student_id
FROM notifications n
JOIN notification_delivery_status ds ON ds.notification_id = n.notification_id
WHERE n.notification_type = 'Placement'
  AND ds.delivery_state = 'delivered'
  AND ds.delivery_timestamp >= NOW() - INTERVAL '7 days';
```

Recommended indexes:
```sql
CREATE INDEX idx_notifications_type_recent
ON notifications (notification_type, published_at DESC, notification_id);

CREATE INDEX idx_delivery_notification_recent
ON notification_delivery_status (notification_id, delivery_timestamp DESC, student_id)
WHERE delivery_state = 'delivered';
```

Expected complexity discussion:
- Filter first on low-cardinality `notification_type` plus time window to reduce candidate notification ids.
- Join then uses indexed `notification_id` path into delivery rows.
- Distinct on `student_id` still costs, but with a 7-day window it remains bounded; for heavier analytics, pre-aggregate into daily rollup tables.

