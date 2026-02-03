from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.accounts.permissions import IsStaff
from apps.core.repositories.rentals import RentalRepository
from .models import RentalAgreement
from .serializers import RentalAgreementSerializer, RentalCreateSerializer, RentalReturnSerializer
from .services import create_rental, return_rental


class RentalViewSet(viewsets.ModelViewSet):
    queryset = RentalAgreement.objects.all()
    serializer_class = RentalAgreementSerializer

    def get_queryset(self):
        return RentalRepository.for_user(self.request.user)

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [permissions.IsAuthenticated()]
        return [IsStaff()]

    def get_serializer_class(self):
        if self.action == "create":
            return RentalCreateSerializer
        if self.action == "return_rental":
            return RentalReturnSerializer
        return RentalAgreementSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        deposit_amount = serializer.validated_data["deposit_amount"]
        rental = serializer.save(status="DRAFT")
        create_rental(rental, deposit_amount)
        return Response(RentalAgreementSerializer(rental).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="return")
    def return_rental(self, request, pk=None):
        rental = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        invoice = return_rental(
            rental,
            serializer.validated_data.get("actual_return_date"),
            serializer.validated_data.get("bad_condition", False),
        )
        return Response({"rental": RentalAgreementSerializer(rental).data, "invoice_total": str(invoice.total)})
