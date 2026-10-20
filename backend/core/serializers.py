import json

from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import URLValidator
from rest_framework import serializers

from .models import (
    Certification,
    ContactMessage,
    Education,
    Experience,
    Profile,
    Project,
    Resume,
    Skill,
    WebsiteSettings,
)


# ---------------------------------------------------------------- helpers
class TagListField(serializers.Field):
    """Accepts a list, a JSON string, or 'a, b, c'. Returns a clean list."""

    def to_representation(self, value):
        return value or []

    def to_internal_value(self, data):
        if isinstance(data, str):
            try:
                parsed = json.loads(data)
                if isinstance(parsed, list):
                    data = parsed
            except ValueError:
                pass
        if isinstance(data, str):
            data = data.split(",")
        if not isinstance(data, list):
            raise serializers.ValidationError("Provide a list of technologies.")
        cleaned = []
        for item in data:
            item = str(item).strip()
            if item and item not in cleaned:
                if len(item) > 40:
                    raise serializers.ValidationError("Each technology must be 40 characters or fewer.")
                cleaned.append(item)
        if len(cleaned) > 25:
            raise serializers.ValidationError("A maximum of 25 technologies is allowed.")
        return cleaned


class RemovableFilesMixin:
    """Lets the dashboard clear an image with e.g. remove_profile_picture=true."""

    removable = {}  # {"remove_profile_picture": "profile_picture"}

    def _apply_removals(self, validated_data):
        for flag, field in self.removable.items():
            wants_removal = validated_data.pop(flag, False)
            if wants_removal and field not in validated_data:
                validated_data[field] = ""
        return validated_data

    def create(self, validated_data):
        return super().create(self._apply_removals(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._apply_removals(validated_data))


class DateRangeMixin:
    def validate(self, attrs):
        inst = self.instance
        start = attrs.get("start_date", getattr(inst, "start_date", None))
        end = attrs.get("end_date", getattr(inst, "end_date", None))
        current = attrs.get("is_current", getattr(inst, "is_current", False))
        if current:
            attrs["end_date"] = None
        elif not end:
            raise serializers.ValidationError(
                {"end_date": "Provide an end date or mark this as current."}
            )
        elif start and end < start:
            raise serializers.ValidationError({"end_date": "End date cannot be before start date."})
        return attrs


# ---------------------------------------------------------------- profile
class ProfileSerializer(RemovableFilesMixin, serializers.ModelSerializer):
    removable = {
        "remove_profile_picture": "profile_picture",
        "remove_hero_background": "hero_background",
    }
    remove_profile_picture = serializers.BooleanField(write_only=True, required=False)
    remove_hero_background = serializers.BooleanField(write_only=True, required=False)
    other_links = serializers.JSONField(required=False)

    class Meta:
        model = Profile
        fields = "__all__"
        read_only_fields = ["id", "updated_at"]

        def validate_other_links(self, value):
        # Multipart requests deliver JSON fields as strings, so parse them first.
            if isinstance(value, str):
                try:
                    value = json.loads(value) if value.strip() else []
                except ValueError:
                    raise serializers.ValidationError("Invalid links format.")
            if not isinstance(value, list) or len(value) > 10:
                raise serializers.ValidationError("Provide up to 10 links.")
            url_validator = URLValidator(schemes=["http", "https"])
            cleaned = []
            for item in value:
                if not isinstance(item, dict):
                    raise serializers.ValidationError("Each link must have a label and a url.")
                label = str(item.get("label", "")).strip()[:50]
                url = str(item.get("url", "")).strip()
                if not label or not url:
                    raise serializers.ValidationError("Each link needs both a label and a URL.")
                try:
                    url_validator(url)
                except DjangoValidationError:
                    raise serializers.ValidationError(f"Invalid URL: {url}")
                cleaned.append({"label": label, "url": url})
            return cleaned

class PublicProfileSerializer(ProfileSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not instance.show_phone:
            data["phone"] = ""
        return data


class WebsiteSettingsSerializer(RemovableFilesMixin, serializers.ModelSerializer):
    removable = {"remove_og_image": "og_image"}
    remove_og_image = serializers.BooleanField(write_only=True, required=False)

    class Meta:
        model = WebsiteSettings
        fields = "__all__"
        read_only_fields = ["id", "updated_at"]


# ---------------------------------------------------------------- skills etc.
class SkillSerializer(serializers.ModelSerializer):
    category_label = serializers.CharField(source="get_category_display", read_only=True)
    proficiency = serializers.IntegerField(required=False, allow_null=True, min_value=1, max_value=100)

    class Meta:
        model = Skill
        fields = ["id", "name", "description", "category", "category_label", "proficiency", "icon", "order"]
        read_only_fields = ["id", "order"]


class ExperienceSerializer(DateRangeMixin, serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = "__all__"
        read_only_fields = ["id", "order"]


class EducationSerializer(DateRangeMixin, serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = "__all__"
        read_only_fields = ["id", "order"]


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = "__all__"
        read_only_fields = ["id", "order"]

    def validate(self, attrs):
        issued = attrs.get("issue_date", getattr(self.instance, "issue_date", None))
        expires = attrs.get("expiry_date", getattr(self.instance, "expiry_date", None))
        if issued and expires and expires < issued:
            raise serializers.ValidationError({"expiry_date": "Expiry cannot be before the issue date."})
        return attrs


# ---------------------------------------------------------------- projects
class ProjectAdminSerializer(RemovableFilesMixin, serializers.ModelSerializer):
    removable = {"remove_thumbnail": "thumbnail"}
    remove_thumbnail = serializers.BooleanField(write_only=True, required=False)
    technologies = TagListField(required=False)

    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = ["id", "slug", "order", "created_at", "updated_at"]


class ProjectListSerializer(serializers.ModelSerializer):
    technologies = TagListField(read_only=True)

    class Meta:
        model = Project
        fields = [
            "id", "title", "slug", "summary", "technologies", "thumbnail",
            "github_url", "live_url", "category", "status", "featured",
        ]


class ProjectDetailSerializer(ProjectListSerializer):
    class Meta(ProjectListSerializer.Meta):
        fields = ProjectListSerializer.Meta.fields + ["description", "created_at", "updated_at"]


# ---------------------------------------------------------------- resume
class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ["id", "file", "uploaded_at"]
        read_only_fields = ["id", "uploaded_at"]


# ---------------------------------------------------------------- contact
class ContactCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["name", "email", "subject", "message"]

    def validate_message(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters.")
        return value

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Please enter your name.")
        return value

    def validate_subject(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Subject must be at least 3 characters.")
        return value


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = "__all__"
        read_only_fields = ["id", "name", "email", "subject", "message", "ip_address", "created_at"]