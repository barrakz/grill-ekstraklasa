from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlayerViewSet, CommentViewSet

router = DefaultRouter()
router.register(r'players', PlayerViewSet)
router.register(r'comments', CommentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
