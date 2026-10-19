from django.urls import path

from .views import public as v

urlpatterns = [
    path("profile/", v.ProfileView.as_view()),
    path("settings/", v.SiteSettingsView.as_view()),
    path("skills/", v.SkillListView.as_view()),
    path("projects/", v.ProjectListView.as_view()),
    path("projects/categories/", v.ProjectCategoriesView.as_view()),  # before <slug>
    path("projects/<slug:slug>/", v.ProjectDetailView.as_view()),
    path("experience/", v.ExperienceListView.as_view()),
    path("education/", v.EducationListView.as_view()),
    path("certifications/", v.CertificationListView.as_view()),
    path("resume/", v.ResumeView.as_view()),
    path("contact/", v.ContactCreateView.as_view()),
]