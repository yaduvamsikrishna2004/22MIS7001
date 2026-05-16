Campus Notification Platform (22MIS7001)
Overview

Campus Notification Platform is a workspace-based TypeScript monorepo implementing a production-style notification system for campus communication.
It includes a modular backend API, a responsive frontend experience, and a shared distributed logging middleware used across both runtimes.
Architecture Overview

    notification_app_be: Node.js + Express backend with modular layers, runtime config validation, centralized middleware, health endpoints, and auth bootstrap utilities.
    notification_app_fe: React + Vite + Material UI frontend with notification dashboard, priority feed, pagination, filtering, viewed/unviewed state, and resilient runtime handling.
    logging_middleware: Shared logging package with payload validation, timestamp normalization, retry-aware dispatch, and frontend/backend-safe env handling.
    notification_system_design.md: End-to-end engineering design and staged reasoning.

Repository Structure

22MIS7001/
+-- logging_middleware/
+-- notification_app_be/
+-- notification_app_fe/
+-- notification_system_design.md
+-- .env.example
+-- package.json
+-- README.md

Tech Stack

    TypeScript
    Node.js
    Express
    React
    Vite
    Material UI
    Shared logging middleware (logging_middleware)

Workspace Setup

This repository uses npm workspaces from the root package.json:

    logging_middleware
    notification_app_be
    notification_app_fe

Installation

From repository root:

cd D:\Projects\Afford\22MIS7001
npm install

Environment Setup
Backend (22MIS7001/.env)

Create .env from root .env.example and provide valid values.

Required auth/bootstrap keys (backend only):

    EVALUATION_API_BASE_URL
    EVALUATION_AUTH_PATH
    EVALUATION_AUTH_TIMEOUT_MS
    ACCESS_CODE
    CLIENT_ID
    CLIENT_SECRET
    AUTH_BOOTSTRAP_EMAIL
    AUTH_BOOTSTRAP_NAME
    AUTH_BOOTSTRAP_ROLL_NO

Frontend (22MIS7001/.env or notification_app_fe/.env.local)

Frontend consumes:

    VITE_NOTIFICATION_API_URL
    VITE_API_BEARER_TOKEN

Current target API base:

    http://4.224.186.213/evaluation-service

Frontend runtime:

    http://localhost:3000

Auth / Bootstrap Flow

    Register once with provider to obtain clientID and clientSecret.
    Backend auth bootstrap calls POST /evaluation-service/auth with:

    email
    name
    rollNo
    accessCode
    clientID
    clientSecret

    Auth response returns access_token.
    Frontend uses only Authorization: Bearer <access_token> for notification API requests.

Token Generation Commands

From backend workspace:

cd D:\Projects\Afford\22MIS7001\notification_app_be
npm run auth:token

Write token directly into frontend env file:

npm run auth:token:write-fe

Backend Startup

cd D:\Projects\Afford\22MIS7001\notification_app_be
npm run dev

Frontend Startup

cd D:\Projects\Afford\22MIS7001\notification_app_fe
npm run dev

Frontend URL:

    http://localhost:3000

Health Verification

Backend health endpoint:

    GET /v1/health/status

Example:

Invoke-WebRequest -UseBasicParsing http://localhost:8080/v1/health/status

Core Frontend Features

    Responsive notifications dashboard
    Priority notifications page
    Pagination and filter by notification type
    Viewed/unviewed visual state
    Graceful loading, error, and empty-state handling
    Route-aware query state persistence
    Runtime configuration warnings without app crash

Logging Overview

Centralized logging is enforced via shared middleware:

    Frontend and backend use structured Log(...) calls
    Runtime-safe logging dispatch
    Payload validation and timestamp normalization
    Auth-aware dispatch behavior
    No direct console.log usage in service paths

Validation and Build Commands

From repository root:

npm run build
npm run typecheck

Workspace-specific:

npm run build -w logging_middleware
npm run build -w notification_app_be
npm run build -w notification_app_fe
npm run typecheck -w notification_app_be
npm run typecheck -w notification_app_fe

Security Notes

    Never commit .env or .env.local files.
    Only .env.example is tracked.
    Frontend must only use Bearer token (VITE_API_BEARER_TOKEN).
    ACCESS_CODE, CLIENT_ID, and CLIENT_SECRET remain backend-only.
    Do not log tokens, secrets, or raw credential payloads.

Troubleshooting

    Warning: API base URL not configured
    Ensure VITE_NOTIFICATION_API_URL is set and restart Vite.
    Warning: VITE_API_BEARER_TOKEN missing
    Generate token using backend bootstrap command and update frontend env.
    401 from notifications API
    Token expired/invalid; regenerate token and restart frontend.
    No new env values reflected
    Stop dev server and restart; Vite reads env at startup.
    Path duplication issues (/evaluation-service/evaluation-service/...)
    Keep base URL as .../evaluation-service; frontend resolves notification path accordingly.

Screenshots

Add runtime screenshots under:

    notification_app_fe/screenshots/

Suggested artifacts:

    dashboard view
    priority feed
    filter transitions
    pagination transitions
    loading/error/empty states

Design Document

Detailed architecture, contracts, scaling notes, and staged design decisions are documented in:

    notification_system_design.md
