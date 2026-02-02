from django.db.models import QuerySet
from apps.rentals.models import RentalAgreement, RentalStatus
from apps.accounts.models import User


class RentalRepository:
    @staticmethod
    def for_user(user: User) -> QuerySet[RentalAgreement]:
        if user.role == "CUSTOMER":
            return RentalAgreement.objects.filter(customer=user)
        return RentalAgreement.objects.all()

    @staticmethod
    def active():
        return RentalAgreement.objects.filter(status=RentalStatus.ACTIVE)
