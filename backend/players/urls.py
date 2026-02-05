from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlayerViewSet
from .admin_views import admin_delete_gif

router = DefaultRouter()
router.register(r'', PlayerViewSet)

urlpatterns = [
    path('admin/delete-gif/<int:player_id>/<int:gif_index>/', admin_delete_gif, name='admin_delete_gif'),
    path('', include(router.urls)),
]
