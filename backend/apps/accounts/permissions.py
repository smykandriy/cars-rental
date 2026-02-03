from rest_framework.permissions import BasePermission
from .models import UserRole


class IsAdmin(BasePermission):
    def has_permission(self, request, view) -> bool:
        return request.user.is_authenticated and request.user.role == UserRole.ADMIN


class IsStaff(BasePermission):
    def has_permission(self, request, view) -> bool:
        return request.user.is_authenticated and request.user.role in {UserRole.STAFF, UserRole.ADMIN}


class IsCustomer(BasePermission):
    def has_permission(self, request, view) -> bool:
        return request.user.is_authenticated and request.user.role == UserRole.CUSTOMER
