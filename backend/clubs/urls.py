from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClubViewSet

router = DefaultRouter()
router.register(r'', ClubViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 