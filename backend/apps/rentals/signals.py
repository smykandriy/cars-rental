from django.dispatch import Signal, receiver
from apps.core.repositories.cars import CarRepository
from apps.fleet.models import CarStatus

rental_returned = Signal()


@receiver(rental_returned)
def on_rental_returned(sender, rental, **kwargs):
    CarRepository.set_status(rental.car, CarStatus.AVAILABLE)
