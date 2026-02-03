from rest_framework import serializers
from apps.accounts.models import User
from apps.fleet.models import Car
from .models import RentalAgreement, Deposit, Penalty


class RentalAgreementSerializer(serializers.ModelSerializer):
    customer_email = serializers.EmailField(source="customer.email", read_only=True)
    car_display = serializers.CharField(source="car.__str__", read_only=True)

    class Meta:
        model = RentalAgreement
        fields = (
            "id",
            "customer",
            "customer_email",
            "car",
            "car_display",
            "issue_date",
            "expected_return_date",
            "actual_return_date",
            "status",
        )


class RentalCreateSerializer(serializers.ModelSerializer):
    deposit_amount = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True)

    class Meta:
        model = RentalAgreement
        fields = (
            "customer",
            "car",
            "issue_date",
            "expected_return_date",
            "deposit_amount",
        )

    def validate_customer(self, value: User):
        if value.role != "CUSTOMER":
            raise serializers.ValidationError("Rental customer must be a CUSTOMER")
        return value

    def create(self, validated_data):
        validated_data.pop("deposit_amount", None)
        return super().create(validated_data)


class RentalReturnSerializer(serializers.Serializer):
    actual_return_date = serializers.DateField(required=False)
    bad_condition = serializers.BooleanField(default=False)


class DepositSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deposit
        fields = ("amount", "status")


class PenaltySerializer(serializers.ModelSerializer):
    class Meta:
        model = Penalty
        fields = ("type", "amount", "comment")
