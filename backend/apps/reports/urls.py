from django.urls import path
from .views import OccupancyReportView, FinancialReportView

urlpatterns = [
    path("occupancy/", OccupancyReportView.as_view(), name="occupancy-report"),
    path("financial/", FinancialReportView.as_view(), name="financial-report"),
]
