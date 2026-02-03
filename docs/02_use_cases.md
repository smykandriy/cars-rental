# Use cases

## Actors
- **Customer**
- **Staff** (STAFF role)
- **Admin** (ADMIN role)

## Use case list (brief)
1. **Register account**: Create a customer account with profile details.
2. **Authenticate (login/refresh)**: Obtain or refresh JWT tokens.
3. **View my profile**: Retrieve the authenticated user's profile info.
4. **Browse cars**: List or search available cars.
5. **Manage fleet** (staff/admin): Create, update, or delete cars.
6. **Create rental agreement** (staff/admin): Draft a rental, collect deposit, set car to rented.
7. **View rentals**: Customer sees their rentals; staff/admin sees all rentals.
8. **Return rental** (staff/admin): Record return date, assess penalties, refund deposit, close rental.
9. **Occupancy report** (authenticated): View car occupancy for a date.
10. **Financial report** (staff/admin): Revenue, penalties, and counts per car.
11. **Admin console** (admin): Manage users, rentals, fleet, deposits, penalties, and transactions via Django admin.

See `use_case_diagram.puml` for the diagram.
