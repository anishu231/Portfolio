from django.db import transaction
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import (
    Certification, ContactMessage, Education, Experience, Profile, Project, Resume, Skill,
    WebsiteSettings,
)
from ..permissions import IsStaffUser
from ..serializers import (
    CertificationSerializer, ContactMessageSerializer, EducationSerializer, ExperienceSerializer,
    ProfileSerializer, ProjectAdminSerializer, ResumeSerializer, SkillSerializer,
    WebsiteSettingsSerializer,
)


class ReorderMixin:
    @action(detail=False, methods=["post"])
    def reorder(self, request):
        ids = request.data.get("ids")
        if not isinstance(ids, list) or not all(isinstance(i, int) for i in ids):
            return Response({"detail": "ids must be a list of integers."}, status=400)
        model = self.queryset.model
        with transaction.atomic():
            for position, pk in enumerate(ids):
                model.objects.filter(pk=pk).update(order=position)
        return Response({"detail": "Order updated."})


class SkillAdminViewSet(ReorderMixin, viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsStaffUser]
    pagination_class = None

    def perform_create(self, serializer):
        serializer.save(order=Skill.objects.count())


class ExperienceAdminViewSet(ReorderMixin, viewsets.ModelViewSet):
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer
    permission_classes = [IsStaffUser]
    pagination_class = None

    def perform_create(self, serializer):
        serializer.save(order=Experience.objects.count())


class EducationAdminViewSet(ReorderMixin, viewsets.ModelViewSet):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer
    permission_classes = [IsStaffUser]
    pagination_class = None

    def perform_create(self, serializer):
        serializer.save(order=Education.objects.count())


class CertificationAdminViewSet(ReorderMixin, viewsets.ModelViewSet):
    queryset = Certification.objects.all()
    serializer_class = CertificationSerializer
    permission_classes = [IsStaffUser]
    pagination_class = None

    def perform_create(self, serializer):
        serializer.save(order=Certification.objects.count())


class ProjectAdminViewSet(ReorderMixin, viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectAdminSerializer
    permission_classes = [IsStaffUser]

    def get_queryset(self):
        qs = super().get_queryset()
        p = self.request.query_params
        if p.get("category"):
            qs = qs.filter(category__iexact=p["category"])
        if p.get("published") in ("true", "false"):
            qs = qs.filter(is_published=p["published"] == "true")
        if p.get("search"):
            qs = qs.filter(title__icontains=p["search"][:100])
        return qs

    def perform_create(self, serializer):
        serializer.save(order=Project.objects.count())

    def _set_published(self, value):
        project = self.get_object()
        project.is_published = value
        project.save(update_fields=["is_published", "updated_at"])
        return Response(self.get_serializer(project).data)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        return self._set_published(True)

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None):
        return self._set_published(False)


class MessageAdminViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [IsStaffUser]
    http_method_names = ["get", "patch", "delete", "head", "options"]


class SingletonAdminView(APIView):
    permission_classes = [IsStaffUser]
    model = None
    serializer_class = None

    def get(self, request):
        s = self.serializer_class(self.model.load(), context={"request": request})
        return Response(s.data)

    def patch(self, request):
        s = self.serializer_class(
            self.model.load(), data=request.data, partial=True, context={"request": request}
        )
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data)

    put = patch


class ProfileAdminView(SingletonAdminView):
    model = Profile
    serializer_class = ProfileSerializer


class SettingsAdminView(SingletonAdminView):
    model = WebsiteSettings
    serializer_class = WebsiteSettingsSerializer


class ResumeAdminView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request):
        resume = Resume.objects.first()
        if not resume:
            return Response({"file": None, "uploaded_at": None})
        return Response(ResumeSerializer(resume, context={"request": request}).data)

    def post(self, request):
        serializer = ResumeSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        new = serializer.save()
        Resume.objects.exclude(pk=new.pk).delete()  # keep only the latest; old files are removed
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    put = post

    def delete(self, request):
        Resume.objects.all().delete()
        return Response(status=204)


class DashboardStatsView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request):
        return Response({
            "projects": Project.objects.count(),
            "published_projects": Project.objects.filter(is_published=True).count(),
            "skills": Skill.objects.count(),
            "experience": Experience.objects.count(),
            "education": Education.objects.count(),
            "certifications": Certification.objects.count(),
            "messages": ContactMessage.objects.count(),
            "unread_messages": ContactMessage.objects.filter(is_read=False).count(),
            "has_resume": Resume.objects.exists(),
        })