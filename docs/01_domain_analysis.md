# Domain analysis

## Business goal
Provide a rental operations and financial tracking system that lets staff manage cars and rentals, calculate rental charges and penalties, hold/refund deposits, and generate occupancy and financial reports for a defined period.

## Main entities and relationships
- **User** (role: ADMIN, STAFF, CUSTOMER) authenticates and owns rentals. A **CustomerProfile** stores a customer's address and phone. `User` 1..1 `CustomerProfile`.【F:backend/apps/accounts/models.py†L5-L54】
- **Car** is the rentable asset with a class, year, base daily price, and status. `Car` 1..* `RentalAgreement`.【F:backend/apps/fleet/models.py†L5-L24】
- **RentalAgreement** ties a customer to a car and tracks dates + status. `User` 1..* `RentalAgreement`.【F:backend/apps/rentals/models.py†L5-L30】
- **Deposit** is held for a rental and can be refunded/forfeited. `RentalAgreement` 1..1 `Deposit`.【F:backend/apps/rentals/models.py†L33-L49】
- **Penalty** tracks late return or bad condition fees per rental. `RentalAgreement` 1..* `Penalty`.【F:backend/apps/rentals/models.py†L52-L65】
- **PaymentTransaction** records charges and refunds tied to a rental. `RentalAgreement` 1..* `PaymentTransaction`.【F:backend/apps/rentals/models.py†L68-L80】

## Business rules
1. **Rental duration** = `max((end_date - start_date).days, 1)` (same-day rentals are 1 day).【F:backend/apps/rentals/services.py†L16-L19】
2. **Rental charge** = `base_daily_price * duration_days * combined_multiplier`. Combined multiplier is the product of:
   - Base multiplier = 1.0
   - **Duration discount**: >=7 days → 5% discount; >=14 days → 10% discount.
   - **Year factor**: 2% discount per car age year (capped at 10 years), floor at 0.8.
   【F:backend/apps/core/services/pricing.py†L9-L49】【F:backend/apps/core/services/factory.py†L4-L16】
3. **Deposit** is held when a rental is created; a transaction is recorded. The car status is set to RENTED and the rental state moves to ACTIVE.【F:backend/apps/rentals/services.py†L22-L34】
4. **Late return penalty** = `late_days * 50.00` and logged as a `Penalty` and `PaymentTransaction`.【F:backend/apps/rentals/services.py†L36-L69】
5. **Bad condition penalty** = fixed `100.00` and logged as a `Penalty` and `PaymentTransaction`.【F:backend/apps/rentals/services.py†L71-L84】
6. **Deposit refund** = `max(0, deposit.amount - penalties_total)` with status `REFUNDED`, `PARTIAL_REFUND`, or `FORFEITED`. A refund transaction is logged if > 0.【F:backend/apps/rentals/services.py†L93-L111】
7. **Occupancy reporting** marks cars as RENTED if they have an ACTIVE rental overlapping the target date; otherwise it returns the car's status.【F:backend/apps/reports/views.py†L12-L36】【F:backend/apps/core/repositories/cars.py†L8-L20】
