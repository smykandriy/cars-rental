from django.contrib import admin
from .models import RentalAgreement, Deposit, Penalty, PaymentTransaction


@admin.register(RentalAgreement)
class RentalAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "car", "issue_date", "expected_return_date", "actual_return_date", "status")
    list_filter = ("status",)


@admin.register(Deposit)
class DepositAdmin(admin.ModelAdmin):
    list_display = ("rental", "amount", "status")


@admin.register(Penalty)
class PenaltyAdmin(admin.ModelAdmin):
    list_display = ("rental", "type", "amount")


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ("rental", "transaction_type", "amount", "created_at")
