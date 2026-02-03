from dataclasses import dataclass
from apps.rentals.models import RentalAgreement, RentalStatus


class RentalState:
    name: str

    def activate(self, rental: RentalAgreement) -> RentalAgreement:
        raise NotImplementedError

    def return_car(self, rental: RentalAgreement) -> RentalAgreement:
        raise NotImplementedError

    def close(self, rental: RentalAgreement) -> RentalAgreement:
        raise NotImplementedError


@dataclass
class DraftState(RentalState):
    name: str = RentalStatus.DRAFT

    def activate(self, rental: RentalAgreement) -> RentalAgreement:
        rental.status = RentalStatus.ACTIVE
        rental.save(update_fields=["status"])
        return rental

    def return_car(self, rental: RentalAgreement) -> RentalAgreement:
        raise ValueError("Cannot return a draft rental")

    def close(self, rental: RentalAgreement) -> RentalAgreement:
        rental.status = RentalStatus.CANCELLED
        rental.save(update_fields=["status"])
        return rental


@dataclass
class ActiveState(RentalState):
    name: str = RentalStatus.ACTIVE

    def activate(self, rental: RentalAgreement) -> RentalAgreement:
        return rental

    def return_car(self, rental: RentalAgreement) -> RentalAgreement:
        rental.status = RentalStatus.RETURNED
        rental.save(update_fields=["status"])
        return rental

    def close(self, rental: RentalAgreement) -> RentalAgreement:
        raise ValueError("Must return car before closing")


@dataclass
class ReturnedState(RentalState):
    name: str = RentalStatus.RETURNED

    def activate(self, rental: RentalAgreement) -> RentalAgreement:
        raise ValueError("Cannot activate a returned rental")

    def return_car(self, rental: RentalAgreement) -> RentalAgreement:
        return rental

    def close(self, rental: RentalAgreement) -> RentalAgreement:
        rental.status = RentalStatus.CLOSED
        rental.save(update_fields=["status"])
        return rental


STATE_MAP = {
    RentalStatus.DRAFT: DraftState(),
    RentalStatus.ACTIVE: ActiveState(),
    RentalStatus.RETURNED: ReturnedState(),
}


def get_state(rental: RentalAgreement) -> RentalState:
    return STATE_MAP.get(rental.status, DraftState())
