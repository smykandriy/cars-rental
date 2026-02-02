# Architecture

## Overview
- **Backend**: Django + DRF, JWT authentication.
- **Frontend**: React + TypeScript (Vite).
- **Database**: PostgreSQL.
- **API**: REST with OpenAPI via drf-spectacular.

## Modules
- `accounts`: user auth and roles.
- `fleet`: car inventory.
- `rentals`: rental agreements, deposits, penalties, transactions.
- `reports`: occupancy and financial reports.
- `core`: shared services (pricing, builder, repositories).

## API summary
- `/api/auth/*`: register, login, refresh, me
- `/api/cars/*`: car CRUD
- `/api/rentals/*`: rental CRUD, return action
- `/api/reports/*`: occupancy, financial
