from rest_framework import viewsets, permissions, filters
from .models import Car
from .serializers import CarSerializer
from apps.accounts.permissions import IsStaff


class CarViewSet(viewsets.ModelViewSet):
    serializer_class = CarSerializer
    queryset = Car.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["brand", "model", "car_class"]
    ordering_fields = ["base_daily_price", "year", "brand"]

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [permissions.AllowAny()]
        return [IsStaff()]
