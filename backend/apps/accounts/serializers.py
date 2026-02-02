from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import CustomerProfile

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    address = serializers.CharField(write_only=True)
    phone = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("email", "full_name", "password", "address", "phone")

    def create(self, validated_data):
        address = validated_data.pop("address")
        phone = validated_data.pop("phone")
        user = User.objects.create_user(**validated_data)
        CustomerProfile.objects.create(user=user, address=address, phone=phone)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "full_name", "role")
