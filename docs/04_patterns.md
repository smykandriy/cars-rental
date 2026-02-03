# Design patterns & principles

## GoF Patterns (as implemented)

### Strategy
- **Intent**: Swap pricing rules without changing the rental flow.
- **Where**: `BaseCarPricingStrategy`, `DurationPricingStrategy`, and `YearFactorStrategy` implement pricing multipliers and are composed in `CompositePricingStrategy`.
- **Why it fits**: Pricing rules are isolated and combined dynamically to calculate the rental charge.

### Factory
- **Intent**: Centralize creation of the pricing strategy graph.
- **Where**: `PricingStrategyFactory.build()` returns the configured `CompositePricingStrategy`.
- **Why it fits**: Encapsulates construction of pricing strategy variants and discount tiers.

### Builder
- **Intent**: Build an invoice with line items incrementally.
- **Where**: `InvoiceBuilder` collects `LineItem` entries and builds an `Invoice`.
- **Why it fits**: Rental return flow adds items conditionally (rental charge, late fee, bad condition fee).

### State
- **Intent**: Model rental lifecycle transitions and enforce allowed actions.
- **Where**: `DraftState`, `ActiveState`, `ReturnedState` with `get_state()` selecting the correct state.
- **Why it fits**: Behavior differs by rental status (activate, return, close) without complex conditionals.

### Observer (Signals)
- **Intent**: React to rental return events without tight coupling.
- **Where**: `rental_returned` signal and `on_rental_returned` receiver that sets car status to available.
- **Why it fits**: Keeps return-side effects out of the core rental return function.

### Repository
- **Intent**: Encapsulate data access and filtering logic.
- **Where**: `CarRepository`, `RentalRepository`, `ReportRepository` in `apps/core/repositories`.
- **Why it fits**: Centralizes query logic used by views/services.

## SOLID principles (examples)
- **SRP**: Services in `apps/rentals/services.py` focus on rental flows, while pricing logic is isolated in `apps/core/services/pricing.py`.
- **OCP**: New pricing strategies can be added without changing existing logic by extending the strategy list in the factory.
- **LSP**: All pricing strategies adhere to the `PricingStrategy` protocol.
- **ISP**: Roles are separated via permissions (`IsStaff`, `IsAdmin`, `IsCustomer`).
- **DIP**: Rental flow depends on abstractions (strategy protocol) rather than concrete pricing computations.

## GRASP principles (examples)
- **Controller**: DRF viewsets/API views (`CarViewSet`, `RentalViewSet`, report views) coordinate request handling.
- **Creator**: `create_rental` creates `Deposit` and `PaymentTransaction` because it aggregates rental creation steps.
- **Information Expert**: `ReportRepository` composes financial totals because it owns query logic.
- **Low Coupling/High Cohesion**: Pricing, state transitions, reporting, and rental flows are separated into services and repositories.
