from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Grill Ekstraklasa API",
        default_version='v1',
        description="API dla aplikacji Grill Ekstraklasa",
        contact=openapi.Contact(email="contact@example.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/players/", include("players.urls")),
    path("api/clubs/", include("clubs.urls")),
    path("api/comments/", include("comments.urls")),
    path("api/ratings/", include("ratings.urls")),
    # path("api/chat/", include("chat.urls")),
    path("api/", include("core.urls")),
    
    # Dokumentacja API z drf-yasg (Swagger)
    re_path(r'^api/swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('api/swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
