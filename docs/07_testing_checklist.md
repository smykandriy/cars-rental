# Testing checklist

## Backend
1. Start services: `docker compose up --build`.
2. Run migrations inside backend: `docker compose exec backend python manage.py migrate`.
3. Run tests: `docker compose exec backend pytest`.
4. Check Swagger: `http://localhost:8000/api/docs/`.

## Frontend
1. Visit `http://localhost:5173`.
2. Register a customer and login.
3. Login as staff/admin and create a rental.
4. Return a rental and verify penalties in reports.

## Reports
- `/api/reports/occupancy?date=YYYY-MM-DD`
- `/api/reports/financial?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD`
