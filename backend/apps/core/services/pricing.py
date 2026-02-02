from dataclasses import dataclass
from decimal import Decimal
from typing import Protocol
from datetime import date


class PricingStrategy(Protocol):
    def multiplier(self, days: int, car_year: int, issue_date: date) -> Decimal:
        ...


@dataclass
class BaseCarPricingStrategy:
    def multiplier(self, days: int, car_year: int, issue_date: date) -> Decimal:
        return Decimal("1.0")


@dataclass
class DurationPricingStrategy:
    discount_tiers: dict[int, Decimal]

    def multiplier(self, days: int, car_year: int, issue_date: date) -> Decimal:
        multiplier = Decimal("1.0")
        for min_days, discount in sorted(self.discount_tiers.items()):
            if days >= min_days:
                multiplier = Decimal("1.0") - discount
        return multiplier


@dataclass
class YearFactorStrategy:
    def multiplier(self, days: int, car_year: int, issue_date: date) -> Decimal:
        current_year = issue_date.year
        age = max(current_year - car_year, 0)
        factor = Decimal("1.0") - Decimal(min(age, 10)) * Decimal("0.02")
        return max(factor, Decimal("0.8"))


@dataclass
class CompositePricingStrategy:
    strategies: list[PricingStrategy]

    def calculate(self, base_price: Decimal, days: int, car_year: int, issue_date: date) -> Decimal:
        base_total = base_price * Decimal(days)
        total_multiplier = Decimal("1.0")
        for strategy in self.strategies:
            total_multiplier *= strategy.multiplier(days, car_year, issue_date)
        return base_total * total_multiplier
