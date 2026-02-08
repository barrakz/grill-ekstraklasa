from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path('auth/login/', views.LoginView.as_view(), name='api_token_auth'),
    path('auth/register/', views.RegisterUserView.as_view(), name='register_user'),
    path('dramaty-tygodnia/', views.weekly_dramas, name='weekly_dramas'),
    path('najnizsze-live/', views.live_lowest_ratings, name='live_lowest_ratings'),
    path('latest-media/', views.latest_media, name='latest_media'),
    path('latest-cards/', views.latest_cards, name='latest_cards'),
]
