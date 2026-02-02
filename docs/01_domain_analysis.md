# Domain analysis

## Entities
- **User**: authenticates with email; roles: ADMIN, STAFF, CUSTOMER.
- **CustomerProfile**: address and phone tied to a customer.
- **Car**: brand, model, class, year, base daily price, status (available/rented/maintenance).
- **RentalAgreement**: links customer + car; issue, expected return, actual return; status lifecycle.
- **Deposit**: held per rental; refunded or partially withheld.
- **Penalty**: late return and bad condition penalties.
- **PaymentTransaction**: ledger for charges/refunds.

## Business rules
1. Base price is per-day and multiplied by rental duration.
2. Rental duration uses **issue_date to actual_return_date**; at least 1 day.
3. Year coefficient decreases price for older cars (2% per year, floor at 0.8x).
4. Late penalty = extra days * late fee.
5. Bad condition penalty is a fixed fee.
6. Net revenue = rental charge + penalties - deposit refund.

## Assumptions
- Same-day rental counts as 1 day.
- Deposit collected before rental activation.
- Only staff/admin create/close rentals.
- Customers can view only their rentals.
