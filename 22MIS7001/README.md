# Campus Notification Platform (22MIS7001)

This repository contains a staged engineering implementation of a campus notification platform with:
- backend service (`notification_app_be`)
- frontend app (`notification_app_fe`)
- shared distributed logging middleware (`logging_middleware`)

## Project Structure

```text
22MIS7001/
+-- logging_middleware/
+-- notification_app_be/
+-- notification_app_fe/
+-- notification_system_design.md
+-- .env.example
```

## Tech Stack
- TypeScript
- Node.js + Express (backend)
- React + Vite + Material UI (frontend)
- Shared logging middleware (`Log(stack, level, package, message)`)

## Prerequisites
- Node.js 18+
- npm 9+

## Install Dependencies

From workspace root (`D:\Projects\Afford\22MIS7001`):

```powershell
npm install
```

## Environment Setup

### Backend
Copy root `.env.example` to `.env` and fill values.
Important auth/bootstrap values (backend only):
- `EVALUATION_API_BASE_URL`
- `EVALUATION_AUTH_PATH`
- `ACCESS_CODE`
- `CLIENT_ID`
- `CLIENT_SECRET`
- `AUTH_BOOTSTRAP_EMAIL`
- `AUTH_BOOTSTRAP_NAME`
- `AUTH_BOOTSTRAP_ROLL_NO`

### Frontend
Use `notification_app_fe/.env.example` to create `notification_app_fe/.env` (or `.env.local`):
- `VITE_NOTIFICATION_API_URL`
- `VITE_API_BEARER_TOKEN`

## Generate Bearer Token (Backend Utility)

```powershell
cd D:\Projects\Afford\22MIS7001\notification_app_be
npm run auth:token
```

Write token directly to frontend `.env.local`:

```powershell
npm run auth:token:write-fe
```

## Run Backend

```powershell
cd D:\Projects\Afford\22MIS7001\notification_app_be
npm run dev
```

## Run Frontend

```powershell
cd D:\Projects\Afford\22MIS7001\notification_app_fe
npm run dev
```

Frontend runs on:
- `http://localhost:3000`

## Core API Used by Frontend
- `GET /notifications` (resolved against `VITE_NOTIFICATION_API_URL`)
- Authorization header is injected centrally:
  - `Authorization: Bearer <token>`

## Logging
- No `console.log` in application flow
- Use middleware logger from `logging_middleware`

## Validation Commands

```powershell
npm run typecheck -w notification_app_be
npm run typecheck -w notification_app_fe
npm run build -w notification_app_be
npm run build -w notification_app_fe
```
