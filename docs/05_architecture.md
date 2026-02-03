# Architecture

## Architecture style
Layered architecture with clear separation between:
1. **API/Controllers**: DRF viewsets and APIViews handle HTTP requests and permissions.
2. **Services**: Business logic for pricing, rental flow, and state transitions.
3. **Repositories**: Query abstractions for rentals, cars, and reports.
4. **Persistence**: Django ORM models and PostgreSQL database.

## Modules & responsibilities
- **accounts**: Authentication, roles, registration, and profile management.【F:backend/apps/accounts/models.py†L1-L54】【F:backend/apps/accounts/views.py†L1-L35】
- **fleet**: Car inventory management and public browse endpoints.【F:backend/apps/fleet/models.py†L1-L24】【F:backend/apps/fleet/views.py†L1-L20】
- **rentals**: Rental agreements, deposits, penalties, transactions, and rental workflows.【F:backend/apps/rentals/models.py†L1-L80】【F:backend/apps/rentals/services.py†L1-L116】
- **reports**: Occupancy and financial reporting endpoints.【F:backend/apps/reports/views.py†L1-L71】
- **core**: Shared services (pricing, builder, state) and repositories (cars, rentals, reports).【F:backend/apps/core/services/pricing.py†L1-L49】【F:backend/apps/core/services/state.py†L1-L73】【F:backend/apps/core/repositories/cars.py†L1-L20】

## Request flow explanations

### (a) Create rental
1. **Request**: `POST /api/rentals/` handled by `RentalViewSet.create`.
2. **Validation**: `RentalCreateSerializer` validates input and ensures customer role is CUSTOMER.
3. **Service**: `create_rental` creates the deposit, logs a `DEPOSIT_HELD` transaction, sets the car status to RENTED, and activates the rental state.
4. **Response**: Returns the created rental data.
   【F:backend/apps/rentals/views.py†L26-L41】【F:backend/apps/rentals/serializers.py†L23-L52】【F:backend/apps/rentals/services.py†L22-L34】

### (b) Return rental with penalties + deposit refund
1. **Request**: `POST /api/rentals/{id}/return/` handled by `RentalViewSet.return_rental`.
2. **Service**: `return_rental` calculates duration, applies pricing strategies, creates penalties (late/bad condition), creates payment transactions, updates deposit status, refunds deposit if applicable, emits a signal to set car AVAILABLE, and closes the rental state.
3. **Response**: Returns rental data plus invoice total.
   【F:backend/apps/rentals/views.py†L43-L53】【F:backend/apps/rentals/services.py†L36-L116】【F:backend/apps/rentals/signals.py†L1-L12】

### (c) Occupancy report
1. **Request**: `GET /api/reports/occupancy/?date=YYYY-MM-DD` (date optional).
2. **Repository**: `CarRepository.with_current_rental` fetches cars with ACTIVE rentals overlapping the date.
3. **Response**: For each car, returns status and expected return date if rented.
   【F:backend/apps/reports/views.py†L10-L36】【F:backend/apps/core/repositories/cars.py†L1-L20】

### (d) Financial report
1. **Request**: `GET /api/reports/financial/?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD`.
2. **Repository**: `ReportRepository.financial` aggregates transaction totals and rental counts per car.
3. **Response**: Returns revenue, rentals count, penalties total, and net amount (currently equal to revenue).
   【F:backend/apps/reports/views.py†L39-L71】【F:backend/apps/core/repositories/reports.py†L1-L13】
