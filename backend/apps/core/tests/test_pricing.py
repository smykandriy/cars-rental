from datetime import date
from decimal import Decimal
from apps.core.services.factory import PricingStrategyFactory


def test_pricing_calculation():
    pricing = PricingStrategyFactory.build()
    amount = pricing.calculate(Decimal("100.00"), 5, 2022, date(2024, 1, 1))
    assert amount > Decimal("0.00")
