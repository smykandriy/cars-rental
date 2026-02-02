from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decimal import Decimal
from apps.fleet.models import Car

User = get_user_model()


class Command(BaseCommand):
    help = "Seed initial data"

    def handle(self, *args, **options):
        if not User.objects.filter(email="admin@example.com").exists():
            User.objects.create_superuser(
                email="admin@example.com",
                password="admin123",
                full_name="Admin User",
            )
        if not User.objects.filter(email="staff@example.com").exists():
            User.objects.create_user(
                email="staff@example.com",
                password="staff123",
                full_name="Staff User",
                role="STAFF",
                is_staff=True,
            )
        if Car.objects.count() == 0:
            Car.objects.create(
                brand="Toyota",
                model="Corolla",
                car_class="Sedan",
                year=2022,
                base_daily_price=Decimal("80.00"),
                status="AVAILABLE",
            )
            Car.objects.create(
                brand="Ford",
                model="Explorer",
                car_class="SUV",
                year=2021,
                base_daily_price=Decimal("120.00"),
                status="AVAILABLE",
            )
        self.stdout.write(self.style.SUCCESS("Seed data ready"))
