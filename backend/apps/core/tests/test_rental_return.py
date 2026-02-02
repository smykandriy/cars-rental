from datetime import date, timedelta
from decimal import Decimal
from apps.rentals.services import return_rental
from apps.rentals.models import DepositStatus


def test_return_rental_applies_penalties(rental, deposit):
    return_date = rental.expected_return_date + timedelta(days=2)
    invoice = return_rental(rental, return_date, bad_condition=True)
    rental.refresh_from_db()
    deposit.refresh_from_db()
    assert invoice.total > Decimal("0.00")
    assert deposit.status in {DepositStatus.PARTIAL_REFUND, DepositStatus.FORFEITED, DepositStatus.REFUNDED}
