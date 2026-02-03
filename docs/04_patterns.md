# Design patterns & principles

## GoF patterns used (from actual code)

### Strategy
- **Intent**: Encapsulate interchangeable algorithms and select them at runtime.
- **Where**: Pricing strategies implement `multiplier()` and are composed in `CompositePricingStrategy` and constructed via `PricingStrategyFactory`.
- **Code**: `BaseCarPricingStrategy`, `DurationPricingStrategy`, `YearFactorStrategy`, `CompositePricingStrategy` in `apps/core/services/pricing.py`; factory in `apps/core/services/factory.py`.
- **Why it fits**: Pricing policies vary by duration and car year; strategies allow adding/removing rules without changing calculation consumers (e.g., rental return flow).【F:backend/apps/core/services/pricing.py†L1-L49】【F:backend/apps/core/services/factory.py†L1-L16】

### Factory (Factory Method / Simple Factory)
- **Intent**: Centralize creation logic for related objects.
- **Where**: `PricingStrategyFactory.build()` assembles the composite pricing strategy with configured tiers and factors.
- **Why it fits**: Keeps pricing configuration in one place and avoids duplicating instantiation logic in services.【F:backend/apps/core/services/factory.py†L1-L16】

### Builder
- **Intent**: Construct complex objects step-by-step.
- **Where**: `InvoiceBuilder` accumulates `LineItem` instances and produces an `Invoice`.
- **Why it fits**: The return flow adds items conditionally (rental charge, late fee, bad condition fee) before building the invoice.【F:backend/apps/core/services/builder.py†L1-L33】【F:backend/apps/rentals/services.py†L44-L84】

### State
- **Intent**: Allow an object to alter its behavior when its internal state changes.
- **Where**: `DraftState`, `ActiveState`, `ReturnedState` implement actions (activate, return, close) and are selected by `get_state` based on `RentalAgreement.status`.
- **Why it fits**: Prevents invalid transitions (e.g., closing before return) and centralizes status changes.【F:backend/apps/core/services/state.py†L1-L73】

### Observer
- **Intent**: Define a one-to-many dependency so that when one object changes state, all dependents are notified.
- **Where**: `rental_returned` signal triggers `on_rental_returned` to update car status when a rental is returned.
- **Why it fits**: Decouples rental return processing from car status updates.【F:backend/apps/rentals/signals.py†L1-L12】【F:backend/apps/rentals/services.py†L113-L115】

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
