from django.db.models import Q
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import (
    Certification, Education, Experience, Profile, Project, Resume, Skill, WebsiteSettings,
)
from ..serializers import (
    CertificationSerializer, ContactCreateSerializer, EducationSerializer, ExperienceSerializer,
    ProjectDetailSerializer, ProjectListSerializer, PublicProfileSerializer, ResumeSerializer,
    SkillSerializer, WebsiteSettingsSerializer,
)
from ..throttles import ContactBurstThrottle, ContactHourlyThrottle, client_ip


class PublicMixin:
    # No session auth on public endpoints: anonymous visitors can only read (or post a contact message).
    authentication_classes = []
    permission_classes = [AllowAny]


class ProfileView(PublicMixin, APIView):
    def get(self, request):
        return Response(PublicProfileSerializer(Profile.load(), context={"request": request}).data)


class SiteSettingsView(PublicMixin, APIView):
    def get(self, request):
        return Response(WebsiteSettingsSerializer(WebsiteSettings.load(), context={"request": request}).data)


class SkillListView(PublicMixin, generics.ListAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    pagination_class = None


class ProjectListView(PublicMixin, generics.ListAPIView):
    serializer_class = ProjectListSerializer

    def get_queryset(self):
        qs = Project.objects.filter(is_published=True)
        p = self.request.query_params
        if p.get("category"):
            qs = qs.filter(category__iexact=p["category"])
        if p.get("status") in {"completed", "in_progress", "planned"}:
            qs = qs.filter(status=p["status"])
        if p.get("featured", "").lower() in ("1", "true"):
            qs = qs.filter(featured=True)
        if p.get("search"):
            q = p["search"][:100]
            qs = qs.filter(Q(title__icontains=q) | Q(summary__icontains=q))
        return qs


class ProjectDetailView(PublicMixin, generics.RetrieveAPIView):
    queryset = Project.objects.filter(is_published=True)
    serializer_class = ProjectDetailSerializer
    lookup_field = "slug"


class ProjectCategoriesView(PublicMixin, APIView):
    def get(self, request):
        cats = (
            Project.objects.filter(is_published=True)
            .exclude(category="")
            .order_by("category")
            .values_list("category", flat=True)
            .distinct()
        )
        return Response(list(cats))


class ExperienceListView(PublicMixin, generics.ListAPIView):
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer
    pagination_class = None


class EducationListView(PublicMixin, generics.ListAPIView):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer
    pagination_class = None


class CertificationListView(PublicMixin, generics.ListAPIView):
    queryset = Certification.objects.all()
    serializer_class = CertificationSerializer
    pagination_class = None


class ResumeView(PublicMixin, APIView):
    def get(self, request):
        resume = Resume.objects.first()  # ordered by newest upload
        if not resume:
            return Response({"url": None, "uploaded_at": None})
        data = ResumeSerializer(resume, context={"request": request}).data
        return Response({"url": data["file"], "uploaded_at": data["uploaded_at"]})


class ContactCreateView(PublicMixin, APIView):
    throttle_classes = [ContactBurstThrottle, ContactHourlyThrottle]

    def post(self, request):
        # Honeypot: real users never see or fill the hidden "website" field.
        if request.data.get("website"):
            return Response({"detail": "Thank you for your message."}, status=201)
        serializer = ContactCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(ip_address=client_ip(request))
        return Response({"detail": "Thank you! Your message has been sent."}, status=201)