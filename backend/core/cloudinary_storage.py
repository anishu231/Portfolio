import os

import cloudinary
import cloudinary.uploader
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible


@deconstructible
class CloudinaryStorage(Storage):
    """Minimal Cloudinary storage. Images use 'image', PDFs use 'raw'."""

    resource_type = "image"

    def _open(self, name, mode="rb"):
        raise NotImplementedError("Files are served directly from Cloudinary.")

    def _save(self, name, content):
        public_id = os.path.splitext(name)[0] if self.resource_type == "image" else name
        content.seek(0)
        result = cloudinary.uploader.upload(
            content,
            public_id=public_id,
            resource_type=self.resource_type,
            overwrite=False,
            use_filename=False,
        )
        # Store only the path we need to rebuild the URL / delete later.
        return result["public_id"] if self.resource_type == "image" else result["public_id"]

    def delete(self, name):
        try:
            cloudinary.uploader.destroy(
                os.path.splitext(name)[0] if self.resource_type == "image" else name,
                resource_type=self.resource_type,
            )
        except Exception:
            pass

    def exists(self, name):
        return False  # names are unique (random uuid), so never collide

    def url(self, name):
        url, _ = cloudinary.utils.cloudinary_url(name, resource_type=self.resource_type, secure=True)
        return url


class RawCloudinaryStorage(CloudinaryStorage):
    resource_type = "raw"