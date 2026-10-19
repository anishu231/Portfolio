from django.contrib import admin

from .models import (
    Certification, ContactMessage, Education, Experience, Profile, Project, Resume, Skill,
    WebsiteSettings,
)

admin.site.register([Profile, Skill, Experience, Education, Certification, Resume, WebsiteSettings])


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "status", "featured", "is_published")
    list_filter = ("status", "featured", "is_published")
    search_fields = ("title",)


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("subject", "name", "email", "is_read", "created_at")
    readonly_fields = ("name", "email", "subject", "message", "ip_address", "created_at")