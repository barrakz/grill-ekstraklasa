from django.urls import path
from rest_framework.authtoken import views as auth_views
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path('api/auth/login/', auth_views.obtain_auth_token, name='api_token_auth'),
    path('api/auth/register/', views.register_user, name='register_user'),
]
