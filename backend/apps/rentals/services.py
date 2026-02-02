from datetime import date
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from apps.core.services.factory import PricingStrategyFactory
from apps.core.services.builder import InvoiceBuilder
from apps.core.repositories.cars import CarRepository
from apps.core.services.state import get_state
from apps.fleet.models import CarStatus
from .models import RentalAgreement, Deposit, Penalty, PenaltyType, PaymentTransaction, TransactionType
from .signals import rental_returned


LATE_FEE_PER_DAY = Decimal("50.00")
BAD_CONDITION_FEE = Decimal("100.00")


def calculate_duration_days(start_date: date, end_date: date) -> int:
    days = (end_date - start_date).days
    return max(days, 1)


@transaction.atomic
def create_rental(rental: RentalAgreement, deposit_amount: Decimal) -> Deposit:
    Deposit.objects.create(rental=rental, amount=deposit_amount)
    PaymentTransaction.objects.create(
        rental=rental,
        transaction_type=TransactionType.DEPOSIT_HELD,
        amount=deposit_amount,
        note="Deposit collected",
    )
    CarRepository.set_status(rental.car, CarStatus.RENTED)
    get_state(rental).activate(rental)
    return rental.deposit


@transaction.atomic
def return_rental(rental: RentalAgreement, return_date: date | None, bad_condition: bool):
    actual_return = return_date or timezone.now().date()
    rental.actual_return_date = actual_return
    rental.save(update_fields=["actual_return_date"])
    get_state(rental).return_car(rental)
    pricing = PricingStrategyFactory.build()
    duration_days = calculate_duration_days(rental.issue_date, actual_return)
    rental_charge = pricing.calculate(rental.car.base_daily_price, duration_days, rental.car.year, rental.issue_date)

    invoice = InvoiceBuilder().add_item("Rental charge", rental_charge)

    penalties_total = Decimal("0.00")
    if actual_return > rental.expected_return_date:
        late_days = (actual_return - rental.expected_return_date).days
        late_fee = LATE_FEE_PER_DAY * Decimal(late_days)
        Penalty.objects.create(
            rental=rental,
            type=PenaltyType.LATE_RETURN,
            amount=late_fee,
            comment=f"Late by {late_days} day(s)",
        )
        penalties_total += late_fee
        invoice.add_item("Late return penalty", late_fee)

    if bad_condition:
        Penalty.objects.create(
            rental=rental,
            type=PenaltyType.BAD_CONDITION,
            amount=BAD_CONDITION_FEE,
            comment="Bad condition reported",
        )
        penalties_total += BAD_CONDITION_FEE
        invoice.add_item("Bad condition penalty", BAD_CONDITION_FEE)

    PaymentTransaction.objects.create(
        rental=rental,
        transaction_type=TransactionType.RENTAL_CHARGE,
        amount=rental_charge,
        note="Rental charge",
    )

    if penalties_total > 0:
        PaymentTransaction.objects.create(
            rental=rental,
            transaction_type=TransactionType.PENALTY_CHARGE,
            amount=penalties_total,
            note="Penalties",
        )

    deposit = rental.deposit
    refund_amount = max(Decimal("0.00"), deposit.amount - penalties_total)
    if refund_amount == deposit.amount:
        deposit.status = "REFUNDED"
    elif refund_amount == Decimal("0.00"):
        deposit.status = "FORFEITED"
    else:
        deposit.status = "PARTIAL_REFUND"
    deposit.save(update_fields=["status"])

    if refund_amount > 0:
        PaymentTransaction.objects.create(
            rental=rental,
            transaction_type=TransactionType.DEPOSIT_REFUND,
            amount=refund_amount,
            note="Deposit refund",
        )

    rental_returned.send(sender=RentalAgreement, rental=rental)
    get_state(rental).close(rental)
    return invoice.build()
