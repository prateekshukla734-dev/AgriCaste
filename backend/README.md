# Backend (Express + Mongo)

Quick start for the MERN backend.

## Setup

1. Copy `.env.example` to `.env` and edit values.
2. Install dependencies.
3. Run in dev mode.

## Env

- `PORT` (default 5000)
- `MONGODB_URI` (e.g., mongodb://localhost:27017/sih_db)
- `NODE_ENV` (development/production)
- `CORS_ORIGIN` (comma-separated origins, e.g., http://localhost:5173)

## API

- GET `/api/health` → `{ status: "ok" }`
