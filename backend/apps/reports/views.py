from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum
from apps.accounts.permissions import IsStaff
from apps.core.repositories.cars import CarRepository
from apps.core.repositories.reports import ReportRepository
from apps.rentals.models import RentalAgreement, PaymentTransaction, TransactionType


class OccupancyReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        date_str = request.query_params.get("date")
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date() if date_str else datetime.utcnow().date()
        cars = CarRepository.with_current_rental(target_date)
        data = []
        for car in cars:
            current_rental = car.current_rentals[0] if getattr(car, "current_rentals", []) else None
            status = car.status
            if current_rental:
                status = "RENTED"
            data.append(
                {
                    "car_id": car.id,
                    "car": str(car),
                    "status": status,
                    "expected_return_date": current_rental.expected_return_date if current_rental else None,
                }
            )
        return Response(data)


class FinancialReportView(APIView):
    permission_classes = [IsStaff]

    def get(self, request):
        date_from = datetime.strptime(request.query_params.get("date_from"), "%Y-%m-%d").date()
        date_to = datetime.strptime(request.query_params.get("date_to"), "%Y-%m-%d").date()
        totals = ReportRepository.financial(date_from, date_to)
        rentals = RentalAgreement.objects.filter(issue_date__gte=date_from, issue_date__lte=date_to)
        transactions = PaymentTransaction.objects.filter(rental__in=rentals)
        data = []
        for row in totals:
            car_id = row["rental__car_id"]
            penalty_total = transactions.filter(
                rental__car_id=car_id, transaction_type=TransactionType.PENALTY_CHARGE
            ).aggregate(total=Sum("amount"))["total"] or 0
            net_amount = row["revenue"] or 0
            data.append(
                {
                    "car_id": car_id,
                    "revenue": str(row["revenue"] or 0),
                    "rentals_count": row["rentals_count"],
                    "penalties_total": str(penalty_total),
                    "net_amount": str(net_amount),
                }
            )
        return Response(data)
