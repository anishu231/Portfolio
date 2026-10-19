import { useSite } from "../../context/SiteContext";

export default function Footer() {
  const { profile, settings } = useSite();
  return (
    <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-line">
      {settings?.footer_text || `© ${new Date().getFullYear()} ${profile?.full_name || ""}. All rights reserved.`}
    </footer>
  );
}