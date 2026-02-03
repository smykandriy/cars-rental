from django.contrib import admin
from .models import Car


@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ("brand", "model", "car_class", "year", "base_daily_price", "status")
    list_filter = ("status", "car_class", "brand")
    search_fields = ("brand", "model")
