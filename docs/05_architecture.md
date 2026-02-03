# Architecture

## Architecture style
Layered architecture with clear separation:
- **API layer**: DRF views/viewsets in each app handle requests and permissions.
- **Service layer**: Business logic in `apps/rentals/services.py` and `apps/core/services/*`.
- **Repository layer**: Query helpers in `apps/core/repositories/*`.
- **Data layer**: Django models persist to PostgreSQL.

## Modules and responsibilities
- **accounts**: Custom user model, roles, registration, JWT authentication, profile management.
- **fleet**: Car inventory CRUD and status tracking.
- **rentals**: Rental agreements, deposits, penalties, transactions, rental lifecycle.
- **reports**: Occupancy and financial reporting endpoints.
- **core**: Shared services (pricing, invoice builder, state machine) and repositories.

## Request flow details

### (a) Create rental
1. **API**: `POST /api/rentals/` in `RentalViewSet` validates input with `RentalCreateSerializer`.
2. **Service**: `create_rental` creates a `Deposit` and a `PaymentTransaction` (deposit held).
3. **State transition**: Rental status moves from DRAFT to ACTIVE via `DraftState.activate`.
4. **Fleet update**: `CarRepository.set_status` marks the car as RENTED.
5. **Response**: Rental agreement is serialized and returned.

### (b) Return rental with penalties + deposit refund
1. **API**: `POST /api/rentals/{id}/return/` validates with `RentalReturnSerializer`.
2. **Service**: `return_rental` calculates duration, applies pricing strategies, and builds an invoice.
3. **Penalties**: Late return and bad condition penalties are created if applicable.
4. **Transactions**: Rental charge and penalty charges are recorded; deposit refund is created if needed.
5. **Deposit status**: Updated to REFUNDED, PARTIAL_REFUND, or FORFEITED.
6. **Signal**: `rental_returned` updates car status back to AVAILABLE.
7. **State transition**: Rental status becomes RETURNED and then CLOSED.
8. **Response**: Invoice total and updated rental data are returned.

### (c) Occupancy report
1. **API**: `GET /api/reports/occupancy/` with optional `date`.
2. **Repository**: `CarRepository.with_current_rental` prefetches active rentals with expected returns after the target date.
3. **Response**: Each car is labeled as RENTED if there is a current rental, otherwise its stored status.

### (d) Financial report
1. **API**: `GET /api/reports/financial/` with `date_from` and `date_to`.
2. **Repository**: `ReportRepository.financial` aggregates revenue and rental counts by car.
3. **Service logic**: Penalty totals are computed per car for the period.
4. **Response**: Revenue, penalty totals, and net amounts per car.
