from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClubViewSet
from .club_players_views import ClubPlayersViewSet

router = DefaultRouter()
router.register(r'', ClubViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('<int:club_pk>/players/', ClubPlayersViewSet.as_view({'get': 'list'}), name='club-players-list'),
    path('<int:club_pk>/players/<int:pk>/', ClubPlayersViewSet.as_view({'get': 'retrieve'}), name='club-players-detail'),
] 