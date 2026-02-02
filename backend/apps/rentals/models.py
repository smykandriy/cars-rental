from django.db import models
from django.utils import timezone
from apps.accounts.models import User
from apps.fleet.models import Car


class RentalStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    ACTIVE = "ACTIVE", "Active"
    RETURNED = "RETURNED", "Returned"
    CLOSED = "CLOSED", "Closed"
    CANCELLED = "CANCELLED", "Cancelled"


class RentalAgreement(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="rentals")
    car = models.ForeignKey(Car, on_delete=models.PROTECT, related_name="rentals")
    issue_date = models.DateField()
    expected_return_date = models.DateField()
    actual_return_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=RentalStatus.choices, default=RentalStatus.DRAFT)

    def __str__(self) -> str:
        return f"Rental {self.id} - {self.car}"

    def mark_returned(self, return_date=None):
        self.actual_return_date = return_date or timezone.now().date()
        self.status = RentalStatus.RETURNED
        self.save(update_fields=["actual_return_date", "status"])


class DepositStatus(models.TextChoices):
    HELD = "HELD", "Held"
    REFUNDED = "REFUNDED", "Refunded"
    PARTIAL_REFUND = "PARTIAL_REFUND", "Partial refund"
    FORFEITED = "FORFEITED", "Forfeited"


class Deposit(models.Model):
    rental = models.OneToOneField(RentalAgreement, on_delete=models.CASCADE, related_name="deposit")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=DepositStatus.choices, default=DepositStatus.HELD)


class PenaltyType(models.TextChoices):
    LATE_RETURN = "LATE_RETURN", "Late return"
    BAD_CONDITION = "BAD_CONDITION", "Bad condition"


class Penalty(models.Model):
    rental = models.ForeignKey(RentalAgreement, on_delete=models.CASCADE, related_name="penalties")
    type = models.CharField(max_length=20, choices=PenaltyType.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    comment = models.CharField(max_length=255, blank=True)


class TransactionType(models.TextChoices):
    RENTAL_CHARGE = "RENTAL_CHARGE", "Rental charge"
    DEPOSIT_HELD = "DEPOSIT_HELD", "Deposit held"
    DEPOSIT_REFUND = "DEPOSIT_REFUND", "Deposit refund"
    PENALTY_CHARGE = "PENALTY_CHARGE", "Penalty charge"


class PaymentTransaction(models.Model):
    rental = models.ForeignKey(RentalAgreement, on_delete=models.CASCADE, related_name="transactions")
    transaction_type = models.CharField(max_length=30, choices=TransactionType.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    note = models.CharField(max_length=255, blank=True)
