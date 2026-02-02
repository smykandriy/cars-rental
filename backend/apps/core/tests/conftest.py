import pytest
from datetime import date, timedelta
from decimal import Decimal
from django.contrib.auth import get_user_model
from apps.fleet.models import Car
from apps.rentals.models import RentalAgreement, Deposit

User = get_user_model()


@pytest.fixture
def customer(db):
    return User.objects.create_user(email="customer@example.com", full_name="Customer", password="pass")


@pytest.fixture
def car(db):
    return Car.objects.create(
        brand="Toyota",
        model="Corolla",
        car_class="Sedan",
        year=2020,
        base_daily_price=Decimal("100.00"),
        status="AVAILABLE",
    )


@pytest.fixture
def rental(db, customer, car):
    return RentalAgreement.objects.create(
        customer=customer,
        car=car,
        issue_date=date.today(),
        expected_return_date=date.today() + timedelta(days=3),
        status="ACTIVE",
    )


@pytest.fixture
def deposit(db, rental):
    return Deposit.objects.create(rental=rental, amount=Decimal("200.00"))
