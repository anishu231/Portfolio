import os

from django.core.exceptions import ValidationError
from django.db.models.fields.files import FieldFile
from PIL import Image

MAX_IMAGE_BYTES = 5 * 1024 * 1024
MAX_PDF_BYTES = 10 * 1024 * 1024
MAX_IMAGE_DIMENSION = 8000
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
IMAGE_FORMATS = {"JPEG", "PNG", "WEBP"}


def _is_already_stored(file):
    # Skip files that are already saved (e.g. an unchanged field in Django admin).
    return isinstance(file, FieldFile) and getattr(file, "_committed", True)


def validate_image_file(file):
    if _is_already_stored(file):
        return
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in IMAGE_EXTENSIONS:
        raise ValidationError("Only JPG, PNG and WebP images are allowed.")
    if file.size > MAX_IMAGE_BYTES:
        raise ValidationError("Image must be 5 MB or smaller.")

    try:
        file.seek(0)
        with Image.open(file) as img:
            width, height = img.size
            fmt = img.format
            img.verify()
    except Exception:
        raise ValidationError("The uploaded file is not a valid image.")
    finally:
        file.seek(0)

    if fmt not in IMAGE_FORMATS:
        raise ValidationError("Only JPG, PNG and WebP images are allowed.")
    if max(width, height) > MAX_IMAGE_DIMENSION:
        raise ValidationError(f"Image dimensions must not exceed {MAX_IMAGE_DIMENSION}px.")


def validate_pdf_file(file):
    if _is_already_stored(file):
        return
    if os.path.splitext(file.name)[1].lower() != ".pdf":
        raise ValidationError("Only PDF files are allowed.")
    if file.size > MAX_PDF_BYTES:
        raise ValidationError("PDF must be 10 MB or smaller.")
    file.seek(0)
    header = file.read(5)
    file.seek(0)
    if header != b"%PDF-":
        raise ValidationError("The uploaded file is not a valid PDF.")