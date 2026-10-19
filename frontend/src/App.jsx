import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import { ProfileForm, AboutForm, SocialLinksForm, SettingsForm } from "./pages/admin/SingletonPages";
import { SkillsManager, ExperienceManager, EducationManager, CertificationsManager } from "./pages/admin/CrudPages";
import ProjectsManager from "./pages/admin/ProjectsManager";
import ResumeUpload from "./pages/admin/ResumeUpload";
import MessagesInbox from "./pages/admin/MessagesInbox";
import PublicLayout from "./components/public/PublicLayout";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin-panel/login" element={<Login />} />
      <Route path="/admin-panel" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<ProfileForm />} />
        <Route path="about" element={<AboutForm />} />
        <Route path="skills" element={<SkillsManager />} />
        <Route path="projects" element={<ProjectsManager />} />
        <Route path="experience" element={<ExperienceManager />} />
        <Route path="education" element={<EducationManager />} />
        <Route path="certifications" element={<CertificationsManager />} />
        <Route path="resume" element={<ResumeUpload />} />
        <Route path="social" element={<SocialLinksForm />} />
        <Route path="messages" element={<MessagesInbox />} />
        <Route path="settings" element={<SettingsForm />} />
      </Route>
    </Routes>
  );
}