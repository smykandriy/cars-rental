from decimal import Decimal
from .pricing import BaseCarPricingStrategy, DurationPricingStrategy, YearFactorStrategy, CompositePricingStrategy


class PricingStrategyFactory:
    @staticmethod
    def build() -> CompositePricingStrategy:
        return CompositePricingStrategy(
            strategies=[
                BaseCarPricingStrategy(),
                DurationPricingStrategy({7: Decimal("0.05"), 14: Decimal("0.10")}),
                YearFactorStrategy(),
            ]
        )
