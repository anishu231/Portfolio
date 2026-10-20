import os

import cloudinary
import cloudinary.uploader
import cloudinary.utils
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible


@deconstructible
class CloudinaryStorage(Storage):
    """Minimal Cloudinary storage. Images use 'image', PDFs use 'raw'.

    The stored name is the Cloudinary public_id plus the file extension
    (e.g. 'profile/abc123.jpg'), so url() and delete() can rebuild everything.
    """

    resource_type = "image"

    def _open(self, name, mode="rb"):
        raise NotImplementedError("Files are served directly from Cloudinary.")

    def _public_id(self, name):
        # Images: public_id has no extension. Raw files: extension is part of the id.
        if self.resource_type == "image":
            return os.path.splitext(name)[0]
        return name

    def _save(self, name, content):
        content.seek(0)
        result = cloudinary.uploader.upload(
            content,
            public_id=self._public_id(name),
            resource_type=self.resource_type,
            overwrite=False,
            use_filename=False,
            unique_filename=False,
        )
        if self.resource_type == "image":
            ext = result.get("format") or os.path.splitext(name)[1].lstrip(".")
            return f"{result['public_id']}.{ext}" if ext else result["public_id"]
        return result["public_id"]

    def delete(self, name):
        try:
            cloudinary.uploader.destroy(self._public_id(name), resource_type=self.resource_type)
        except Exception:
            pass

    def exists(self, name):
        return False  # names are random uuids, so they never collide

    def url(self, name):
        url, _ = cloudinary.utils.cloudinary_url(
            self._public_id(name) if self.resource_type == "image" else name,
            resource_type=self.resource_type,
            secure=True,
            format=os.path.splitext(name)[1].lstrip(".") or None if self.resource_type == "image" else None,
        )
        return url

    def get_available_name(self, name, max_length=None):
        return name  # keep our uuid-based name as is


class RawCloudinaryStorage(CloudinaryStorage):
    resource_type = "raw"
