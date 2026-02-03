from django.db import models


class CarStatus(models.TextChoices):
    AVAILABLE = "AVAILABLE", "Available"
    RENTED = "RENTED", "Rented"
    MAINTENANCE = "MAINTENANCE", "Maintenance"


class Car(models.Model):
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    car_class = models.CharField(max_length=50)
    year = models.PositiveIntegerField()
    base_daily_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=CarStatus.choices, default=CarStatus.AVAILABLE)

    def __str__(self) -> str:
        return f"{self.brand} {self.model} ({self.year})"
