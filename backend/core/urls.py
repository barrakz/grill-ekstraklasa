from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path('auth/login/', views.LoginView.as_view(), name='api_token_auth'),
    path('auth/register/', views.RegisterUserView.as_view(), name='register_user'),
]
