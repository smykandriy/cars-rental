# Design patterns & principles

## GoF patterns used (from actual code)

### Strategy
- **Intent**: Encapsulate interchangeable algorithms and select them at runtime.
- **Where**: Pricing strategies implement `multiplier()` and are composed in `CompositePricingStrategy` and constructed via `PricingStrategyFactory`.
- **Code**: `BaseCarPricingStrategy`, `DurationPricingStrategy`, `YearFactorStrategy`, `CompositePricingStrategy` in `apps/core/services/pricing.py`; factory in `apps/core/services/factory.py`.
- **Why it fits**: Pricing policies vary by duration and car year; strategies allow adding/removing rules without changing calculation consumers (e.g., rental return flow).【F:backend/apps/core/services/pricing.py†L1-L49】【F:backend/apps/core/services/factory.py†L1-L16】
### Програмна реалізація (Strategy)
Коротко: різні стратегії обчислюють коефіцієнт вартості, а композит агрегує їх у спільний множник для розрахунку ціни. 【F:backend/apps/core/services/pricing.py†L1-L49】

```python
class DurationPricingStrategy(PricingStrategy):
    def multiplier(self, duration_days: int, car_year: int) -> float:
        return 0.85 if duration_days >= 7 else 1.0

class YearFactorStrategy(PricingStrategy):
    def multiplier(self, duration_days: int, car_year: int) -> float:
        return 1.1 if car_year < 2015 else 1.0

class CompositePricingStrategy(PricingStrategy):
    def __init__(self, strategies: list[PricingStrategy]) -> None:
        self.strategies = strategies

    def multiplier(self, duration_days: int, car_year: int) -> float:
        multiplier = 1.0
        for strategy in self.strategies:
            multiplier *= strategy.multiplier(duration_days, car_year)
        return multiplier
```

### Factory (Factory Method / Simple Factory)
- **Intent**: Centralize creation logic for related objects.
- **Where**: `PricingStrategyFactory.build()` assembles the composite pricing strategy with configured tiers and factors.
- **Why it fits**: Keeps pricing configuration in one place and avoids duplicating instantiation logic in services.【F:backend/apps/core/services/factory.py†L1-L16】
### Програмна реалізація (Factory)
Коротко: фабрика інкапсулює логіку складання об’єкта стратегії, щоб інші сервіси не дублювали конфігурацію. 【F:backend/apps/core/services/factory.py†L1-L16】

```python
class PricingStrategyFactory:
    @staticmethod
    def build() -> PricingStrategy:
        return CompositePricingStrategy(
            [
                BaseCarPricingStrategy(),
                DurationPricingStrategy(),
                YearFactorStrategy(),
            ]
        )
```

### Builder
- **Intent**: Construct complex objects step-by-step.
- **Where**: `InvoiceBuilder` accumulates `LineItem` instances and produces an `Invoice`.
- **Why it fits**: The return flow adds items conditionally (rental charge, late fee, bad condition fee) before building the invoice.【F:backend/apps/core/services/builder.py†L1-L33】【F:backend/apps/rentals/services.py†L44-L84】
### Програмна реалізація (Builder)
Коротко: білдер збирає позиції рахунку поетапно, а потім формує підсумковий `Invoice`. 【F:backend/apps/core/services/builder.py†L1-L33】

```python
class InvoiceBuilder:
    def __init__(self) -> None:
        self.items: list[LineItem] = []

    def add_item(self, description: str, amount: Decimal) -> None:
        self.items.append(LineItem(description=description, amount=amount))

    def build(self) -> Invoice:
        return Invoice(items=self.items)
```

### State
- **Intent**: Allow an object to alter its behavior when its internal state changes.
- **Where**: `DraftState`, `ActiveState`, `ReturnedState` implement actions (activate, return, close) and are selected by `get_state` based on `RentalAgreement.status`.
- **Why it fits**: Prevents invalid transitions (e.g., closing before return) and centralizes status changes.【F:backend/apps/core/services/state.py†L1-L73】
### Програмна реалізація (State)
Коротко: об’єкт стану визначає дозволені дії для конкретного статусу договору. 【F:backend/apps/core/services/state.py†L1-L73】

```python
class DraftState(RentalAgreementState):
    def activate(self) -> None:
        self.rental.status = RentalAgreement.Status.ACTIVE
        self.rental.save()

class ActiveState(RentalAgreementState):
    def return_rental(self) -> None:
        self.rental.status = RentalAgreement.Status.RETURNED
        self.rental.save()
```

### Observer
- **Intent**: Define a one-to-many dependency so that when one object changes state, all dependents are notified.
- **Where**: `rental_returned` signal triggers `on_rental_returned` to update car status when a rental is returned.
- **Why it fits**: Decouples rental return processing from car status updates.【F:backend/apps/rentals/signals.py†L1-L12】【F:backend/apps/rentals/services.py†L113-L115】
### Програмна реалізація (Observer)
Коротко: сигнал сповіщає підписника, коли оренда повернена, і той оновлює стан авто. 【F:backend/apps/rentals/signals.py†L1-L12】

```python
rental_returned = Signal()

@receiver(rental_returned)
def on_rental_returned(sender, rental: RentalAgreement, **kwargs) -> None:
    rental.car.status = Car.Status.AVAILABLE
    rental.car.save()
```

## SOLID principles (examples)
- **SRP (Single Responsibility)**: Pricing strategies each model a single pricing rule, and repositories encapsulate query concerns rather than mixing them in views/services.【F:backend/apps/core/services/pricing.py†L1-L49】【F:backend/apps/core/repositories/cars.py†L1-L20】
- **OCP (Open/Closed)**: New pricing strategies can be added to the composite without modifying calculation consumers (e.g., `return_rental`).【F:backend/apps/core/services/pricing.py†L32-L49】【F:backend/apps/rentals/services.py†L41-L52】
- **LSP (Liskov Substitution)**: All pricing strategies adhere to the `PricingStrategy` protocol and can be interchanged in `CompositePricingStrategy`.
  【F:backend/apps/core/services/pricing.py†L6-L49】
- **ISP (Interface Segregation)**: `PricingStrategy` only requires `multiplier`, keeping the interface minimal.【F:backend/apps/core/services/pricing.py†L6-L11】
- **DIP (Dependency Inversion)**: `return_rental` depends on the abstract strategy interface rather than concrete classes; construction is delegated to the factory.【F:backend/apps/core/services/pricing.py†L6-L11】【F:backend/apps/core/services/factory.py†L1-L16】【F:backend/apps/rentals/services.py†L41-L52】

## GRASP principles (examples)
- **Controller**: DRF views (`RentalViewSet`, `CarViewSet`, `FinancialReportView`, `OccupancyReportView`) handle HTTP requests and delegate to services/repositories.【F:backend/apps/rentals/views.py†L9-L53】【F:backend/apps/fleet/views.py†L7-L20】【F:backend/apps/reports/views.py†L10-L71】
- **Creator**: `RegisterSerializer` creates `CustomerProfile` when creating a `User`, matching responsibility for creating dependent objects.【F:backend/apps/accounts/serializers.py†L8-L27】
- **Information Expert**: `ReportRepository.financial` performs aggregation where the transaction data lives; `CarRepository.with_current_rental` owns occupancy-related data retrieval.【F:backend/apps/core/repositories/reports.py†L1-L13】【F:backend/apps/core/repositories/cars.py†L1-L20】
- **Low Coupling / High Cohesion**: Pricing logic is isolated in `core/services`, rental flow in `rentals/services`, and data access in repositories, keeping modules focused and reducing cross-module dependencies.【F:backend/apps/core/services/pricing.py†L1-L49】【F:backend/apps/rentals/services.py†L1-L116】【F:backend/apps/core/repositories/rentals.py†L1-L14】
