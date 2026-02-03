from dataclasses import dataclass, field
from decimal import Decimal


@dataclass
class LineItem:
    description: str
    amount: Decimal


@dataclass
class Invoice:
    items: list[LineItem] = field(default_factory=list)

    @property
    def total(self) -> Decimal:
        return sum((item.amount for item in self.items), Decimal("0.00"))


class InvoiceBuilder:
    def __init__(self):
        self._items: list[LineItem] = []

    def add_item(self, description: str, amount: Decimal) -> "InvoiceBuilder":
        self._items.append(LineItem(description=description, amount=amount))
        return self

    def build(self) -> Invoice:
        return Invoice(items=self._items)
