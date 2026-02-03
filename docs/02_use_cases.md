# Use cases

## Actors
- **Customer**: authenticated renter.
- **Staff**: operational staff managing rentals and reports.
- **Admin**: administrative staff with full staff privileges plus Django admin access.

## Use case list (brief descriptions)
1. **Register**: Create a customer account with profile details (address, phone).【F:backend/apps/accounts/serializers.py†L8-L27】【F:backend/apps/accounts/views.py†L7-L25】
2. **Login / Refresh Token**: Obtain/refresh JWTs for authenticated access.【F:backend/apps/accounts/views.py†L27-L35】
3. **View My Profile**: Fetch the current authenticated user record.【F:backend/apps/accounts/views.py†L14-L24】
4. **Browse Cars**: List or view cars with search/ordering (public).【F:backend/apps/fleet/views.py†L7-L20】
5. **Manage Fleet** (Staff/Admin): Create/update/delete cars in inventory.【F:backend/apps/fleet/views.py†L7-L20】
6. **Create Rental Agreement** (Staff/Admin): Draft a rental, collect a deposit, set car to RENTED, and activate rental state.【F:backend/apps/rentals/views.py†L26-L41】【F:backend/apps/rentals/services.py†L22-L34】
7. **Return Rental** (Staff/Admin): Calculate rental charge, apply penalties, refund deposit, close rental, and update car status.【F:backend/apps/rentals/views.py†L43-L53】【F:backend/apps/rentals/services.py†L36-L116】
8. **View Rentals**: Customers can list their rentals; staff/admin can view all rentals.【F:backend/apps/core/repositories/rentals.py†L6-L14】【F:backend/apps/rentals/views.py†L14-L24】
9. **Generate Occupancy Report** (Authenticated): View car occupancy for a target date.【F:backend/apps/reports/views.py†L10-L36】
10. **Generate Financial Report** (Staff/Admin): View revenue and penalties for a date range.【F:backend/apps/reports/views.py†L39-L71】
11. **Administer System** (Admin): Use Django admin to manage users, cars, rentals, penalties, and transactions.【F:backend/apps/accounts/admin.py†L6-L32】【F:backend/apps/fleet/admin.py†L5-L11】【F:backend/apps/rentals/admin.py†L5-L24】

See `use_case_diagram.puml` for the diagram.
