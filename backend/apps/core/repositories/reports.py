from datetime import date
from django.db.models import Sum, Count
from apps.rentals.models import RentalAgreement, PaymentTransaction


class ReportRepository:
    @staticmethod
    def financial(date_from: date, date_to: date):
        rentals = RentalAgreement.objects.filter(issue_date__gte=date_from, issue_date__lte=date_to)
        transactions = PaymentTransaction.objects.filter(rental__in=rentals)
        return transactions.values("rental__car_id").annotate(
            revenue=Sum("amount"),
            rentals_count=Count("rental", distinct=True),
        )
