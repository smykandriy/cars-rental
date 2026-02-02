from datetime import date
from django.db.models import Prefetch
from apps.fleet.models import Car, CarStatus
from apps.rentals.models import RentalAgreement, RentalStatus


class CarRepository:
    @staticmethod
    def with_current_rental(target_date: date):
        return Car.objects.prefetch_related(
            Prefetch(
                "rentals",
                queryset=RentalAgreement.objects.filter(
                    status=RentalStatus.ACTIVE,
                    expected_return_date__gte=target_date,
                ),
                to_attr="current_rentals",
            )
        )

    @staticmethod
    def set_status(car: Car, status: str) -> Car:
        car.status = status
        car.save(update_fields=["status"])
        return car
