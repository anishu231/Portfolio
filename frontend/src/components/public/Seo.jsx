import { Helmet } from "react-helmet-async";
import { useSite } from "../../context/SiteContext";

export default function Seo({ title, description, image, type = "website" }) {
  const { settings, profile } = useSite();
  const site = settings?.site_title || "Portfolio";
  const fullTitle = title ? `${title} | ${site}` : profile?.title ? `${site} | ${profile.title}` : site;
  const desc = description || settings?.meta_description || profile?.short_intro || "";
  const img = image || settings?.og_image || profile?.profile_picture || "";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={window.location.href} />
      {img && <meta property="og:image" content={img} />}
      <meta name="twitter:card" content={img ? "summary_large_image" : "summary"} />
    </Helmet>
  );
}