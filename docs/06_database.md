# Database

## Tables
- `accounts_user`
- `accounts_customerprofile`
- `fleet_car`
- `rentals_rentalagreement`
- `rentals_deposit`
- `rentals_penalty`
- `rentals_paymenttransaction`

## Relationships
- User 1..1 CustomerProfile
- User 1..* RentalAgreement
- Car 1..* RentalAgreement
- RentalAgreement 1..1 Deposit
- RentalAgreement 1..* Penalty
- RentalAgreement 1..* PaymentTransaction

## Constraints
- Email unique on User.
- Car status enum.
- Rental status enum.

## Indexes
- Implicit FK indexes by Django on rental/customer/car relationships.

## Migrations strategy
- Django migrations generated during container start (makemigrations + migrate).

## Seed data
- Default admin and staff accounts and sample cars via `manage.py seed`.
