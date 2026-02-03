from datetime import date
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


def test_financial_report_endpoint(db, rental):
    staff = User.objects.create_user(email="staff@example.com", full_name="Staff", password="pass", role="STAFF")
    staff.is_staff = True
    staff.save()
    client = APIClient()
    client.force_authenticate(user=staff)
    response = client.get("/api/reports/financial/?date_from=2020-01-01&date_to=2030-01-01")
    assert response.status_code == 200
