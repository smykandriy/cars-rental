# Domain Analysis

## Business goal
Provide a financial tracking system for a car rental business that manages fleet availability, creates rental agreements with deposits, calculates rental charges and penalties, and produces occupancy and financial reports.

## Main entities and relationships
- **User** with roles (**ADMIN**, **STAFF**, **CUSTOMER**).
- **CustomerProfile** (address, phone) is a 1:1 extension of User.
- **Car** (brand, model, class, year, base daily price, status) can have many rentals.
- **RentalAgreement** links one customer to one car and tracks issue/return dates and status.
- **Deposit** is held 1:1 per rental agreement.
- **Penalty** records late return or bad condition fees (many per rental).
- **PaymentTransaction** records the financial ledger for each rental (many per rental).

## Business rules
1. **Duration and base charge**: Rental charge = base daily price × rental duration in days. Duration uses `issue_date` to actual return date and is never less than 1 day.
2. **Duration discount**: Discounts apply when the duration reaches 7 days (5% discount) or 14 days (10% discount).
3. **Year factor**: Older cars reduce price by 2% per year of age, capped at a 20% reduction (min multiplier 0.8).
4. **Deposit handling**: Deposit is collected when the rental is created and held until return.
5. **Late return penalty**: Late return = late days × fixed daily late fee.
6. **Bad condition penalty**: A fixed fee is applied when bad condition is flagged.
7. **Refund logic**: Deposit is refunded fully, partially, or forfeited based on total penalties.
8. **Revenue**: Financial report uses payment transactions (rental charge, penalties, and deposit refunds) to compute per-car revenue totals.
9. **Occupancy logic**: A car is considered occupied if it has an ACTIVE rental with an expected return date on/after the report date.

## Assumptions used (based on code)
- Same-day rentals count as 1 day.
- Deposit amount is provided by staff at rental creation time.
- Only staff/admin can create or return rentals; customers can only view their own.
- Car status is set to RENTED on creation and AVAILABLE on return via signals.
