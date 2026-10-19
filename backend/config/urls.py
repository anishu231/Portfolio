from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path(settings.DJANGO_ADMIN_URL, admin.site.urls),  # built-in Django admin (backup tool)
    path("api/admin/", include("core.admin_urls")),
    path("api/", include("core.urls")),
]

if settings.DEBUG and settings.STORAGE_BACKEND == "local":
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)