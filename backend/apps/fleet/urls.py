from rest_framework.routers import DefaultRouter
from .views import CarViewSet

router = DefaultRouter()
router.register(r"", CarViewSet, basename="cars")

urlpatterns = router.urls
