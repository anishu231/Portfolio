import os
import uuid

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from django.utils.deconstruct import deconstructible
from django.utils.text import slugify

from .storage import resume_storage
from .validators import validate_image_file, validate_pdf_file


@deconstructible
class UploadTo:
    """Random file names so uploads never collide or leak original names."""

    def __init__(self, folder, keep_name=False):
        self.folder = folder
        self.keep_name = keep_name

    def __call__(self, instance, filename):
        stem, ext = os.path.splitext(filename)
        ext = ext.lower()
        if self.keep_name:
            return f"{self.folder}/{slugify(stem)[:60] or 'file'}-{uuid.uuid4().hex[:8]}{ext}"
        return f"{self.folder}/{uuid.uuid4().hex}{ext}"


class SingletonModel(models.Model):
    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass  # never delete the single row

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class Profile(SingletonModel):
    AVAILABILITY = [
        ("available", "Available for work"),
        ("open", "Open to opportunities"),
        ("busy", "Currently unavailable"),
    ]

    full_name = models.CharField(max_length=120, default="Your Name")
    title = models.CharField("Professional title", max_length=160, blank=True)
    short_intro = models.CharField(max_length=500, blank=True)
    about_me = models.TextField(blank=True)
    career_objective = models.TextField(blank=True)
    background_interests = models.TextField(blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    show_phone = models.BooleanField(default=False)
    location = models.CharField(max_length=120, blank=True)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    other_links = models.JSONField(default=list, blank=True)  # [{"label":..., "url":...}]
    availability_status = models.CharField(max_length=20, choices=AVAILABILITY, default="available")
    availability_note = models.CharField(max_length=160, blank=True)
    profile_picture = models.ImageField(
        upload_to=UploadTo("profile"), blank=True, validators=[validate_image_file]
    )
    hero_background = models.ImageField(
        upload_to=UploadTo("hero"), blank=True, validators=[validate_image_file]
    )
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name


class Skill(models.Model):
    CATEGORIES = [
        ("programming", "Programming"),
        ("backend", "Backend Development"),
        ("databases", "Databases"),
        ("cybersecurity", "Cybersecurity"),
        ("networking", "Networking"),
        ("linux", "Linux"),
        ("cloud", "Cloud"),
        ("devops", "DevOps"),
        ("tools", "Tools"),
    ]
    name = models.CharField(max_length=80)
    description = models.CharField(max_length=300, blank=True)
    category = models.CharField(max_length=30, choices=CATEGORIES)
    proficiency = models.PositiveSmallIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
    )
    icon = models.CharField(max_length=60, blank=True, help_text="Emoji or icon name")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.name


class Project(models.Model):
    STATUS = [("completed", "Completed"), ("in_progress", "In Progress"), ("planned", "Planned")]

    title = models.CharField(max_length=160)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    summary = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    technologies = models.JSONField(default=list, blank=True)
    thumbnail = models.ImageField(
        upload_to=UploadTo("projects"), blank=True, validators=[validate_image_file]
    )
    github_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    category = models.CharField(max_length=60, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default="completed")
    featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)[:190] or "project"
            slug, n = base, 2
            while Project.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{n}"
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Experience(models.Model):
    job_title = models.CharField(max_length=160)
    company = models.CharField(max_length=160)
    location = models.CharField(max_length=120, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "-start_date"]

    def __str__(self):
        return f"{self.job_title} @ {self.company}"


class Education(models.Model):
    degree = models.CharField(max_length=160)
    institution = models.CharField(max_length=160)
    field_of_study = models.CharField(max_length=160, blank=True)
    location = models.CharField(max_length=120, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "-start_date"]
        verbose_name_plural = "education"

    def __str__(self):
        return f"{self.degree} - {self.institution}"


class Certification(models.Model):
    name = models.CharField(max_length=160)
    issuer = models.CharField(max_length=160)
    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    credential_id = models.CharField(max_length=120, blank=True)
    credential_url = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "-issue_date"]

    def __str__(self):
        return self.name


class Resume(models.Model):
    file = models.FileField(
        upload_to=UploadTo("resume", keep_name=True),
        storage=resume_storage,
        validators=[validate_pdf_file],
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"Resume {self.uploaded_at:%Y-%m-%d}"


class ContactMessage(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField(max_length=5000)
    is_read = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.subject} - {self.name}"


class WebsiteSettings(SingletonModel):
    THEMES = [("dark", "Dark"), ("light", "Light"), ("system", "System")]

    site_title = models.CharField(max_length=120, default="My Portfolio")
    meta_description = models.CharField(max_length=300, blank=True)
    og_image = models.ImageField(
        upload_to=UploadTo("seo"), blank=True, validators=[validate_image_file]
    )
    footer_text = models.CharField(max_length=200, blank=True)
    default_theme = models.CharField(max_length=10, choices=THEMES, default="dark")
    show_resume_button = models.BooleanField(default=True)
    show_contact_form = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "website settings"

    def __str__(self):
        return "Website settings"


# ------------------------------------------------------------------
# Remove replaced / orphaned files from storage
# ------------------------------------------------------------------
FILE_FIELDS = {
    Profile: ["profile_picture", "hero_background"],
    Project: ["thumbnail"],
    Resume: ["file"],
    WebsiteSettings: ["og_image"],
}


@receiver(pre_save)
def delete_replaced_files(sender, instance, **kwargs):
    fields = FILE_FIELDS.get(sender)
    if not fields or not instance.pk:
        return
    try:
        old = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return
    for name in fields:
        old_file = getattr(old, name)
        new_file = getattr(instance, name)
        if old_file and old_file.name != getattr(new_file, "name", None):
            old_file.delete(save=False)


@receiver(post_delete)
def delete_files_on_delete(sender, instance, **kwargs):
    for name in FILE_FIELDS.get(sender, []):
        file = getattr(instance, name)
        if file:
            file.delete(save=False)