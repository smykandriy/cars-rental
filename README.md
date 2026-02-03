# Car Rental Financial Tracking System

Production-like monorepo for a car rental company to track rentals and financial metrics.

## Stack
- Backend: Django + DRF + JWT
- Frontend: React + TypeScript (Vite)
- DB: PostgreSQL
- Docker + docker-compose

## Quick start
```bash
docker compose up --build
```

### Services
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/
- Swagger: http://localhost:8000/api/docs/
- Django admin: http://localhost:8000/admin/

### Default credentials (seeded)
- Admin: `admin@example.com` / `admin123`
- Staff: `staff@example.com` / `staff123`

## Environment
Copy `.env.example` if running locally outside Docker.

## Tests
```bash
cd backend
pytest
```

## Docs
See `/docs` for domain analysis, diagrams, architecture, patterns, and testing checklist.
