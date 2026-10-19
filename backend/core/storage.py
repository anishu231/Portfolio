from django.conf import settings
from django.core.files.storage import FileSystemStorage


def resume_storage():
    """PDFs need Cloudinary's 'raw' resource type; other backends use the default."""
    if getattr(settings, "USE_CLOUDINARY", False):
        from cloudinary_storage.storage import RawMediaCloudinaryStorage

        return RawMediaCloudinaryStorage()
    if getattr(settings, "USE_S3", False):
        from django.core.files.storage import default_storage

        return default_storage
    return FileSystemStorage()