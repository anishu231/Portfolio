from django.urls import include, path
from rest_framework.routers import SimpleRouter

from .views import admin as a
from .views import auth

router = SimpleRouter()
router.register("skills", a.SkillAdminViewSet, basename="admin-skills")
router.register("projects", a.ProjectAdminViewSet, basename="admin-projects")
router.register("experience", a.ExperienceAdminViewSet, basename="admin-experience")
router.register("education", a.EducationAdminViewSet, basename="admin-education")
router.register("certifications", a.CertificationAdminViewSet, basename="admin-certifications")
router.register("messages", a.MessageAdminViewSet, basename="admin-messages")

urlpatterns = [
    path("auth/csrf/", auth.CsrfView.as_view()),
    path("auth/login/", auth.LoginView.as_view()),
    path("auth/logout/", auth.LogoutView.as_view()),
    path("auth/me/", auth.MeView.as_view()),
    path("profile/", a.ProfileAdminView.as_view()),
    path("settings/", a.SettingsAdminView.as_view()),
    path("resume/", a.ResumeAdminView.as_view()),
    path("stats/", a.DashboardStatsView.as_view()),
    path("", include(router.urls)),
]