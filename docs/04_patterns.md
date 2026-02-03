# GoF Patterns

## Strategy
- Pricing strategies (base, duration, year factor) in `apps/core/services/pricing.py`.

## State
- Rental state machine (`Draft`, `Active`, `Returned`) in `apps/core/services/state.py`.

## Builder
- Invoice builder for line items in `apps/core/services/builder.py`.

## Factory
- Pricing strategy factory in `apps/core/services/factory.py`.

## Observer
- Django signal `rental_returned` in `apps/rentals/signals.py` updates car status.

## Repository
- Query wrappers in `apps/core/repositories/*`.
