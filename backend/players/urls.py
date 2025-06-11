from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlayerViewSet

router = DefaultRouter()
router.register(r'', PlayerViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
