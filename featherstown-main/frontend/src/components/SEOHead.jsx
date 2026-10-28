import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Dynamically updates document head tags:
 * Title, Meta Description, Keywords, Canonical, Open Graph, Twitter Cards, and JSON-LD schema
 */
export default function SEOHead({
  title = "FeatherTown | Buy Healthy Hand-Tamed Parrots Online in India",
  description = "FeatherTown offers certified healthy companion parrots, hand-tamed conures, macaws, cockatiels, expert care guidance, premium cages, and organic food across India.",
  keywords = "buy parrot online India, hand-tamed parrots, sun conure, cockatiel, african grey, bird accessories, bird food, bird cages Bhubaneswar Odisha",
  ogImage = "https://www.feathertown.online/og-image.png",
  ogType = "website",
  schema = null,
}) {
  const location = useLocation();
  const canonicalUrl = `https://www.feathertown.online${location.pathname}`;

  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // Helper to update or create meta tags
    const updateMeta = (nameAttr, nameVal, content) => {
      let el = document.querySelector(`meta[${nameAttr}="${nameVal}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(nameAttr, nameVal);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // 2. Standard Meta
    updateMeta("name", "description", description);
    updateMeta("name", "keywords", keywords);
    updateMeta("name", "robots", "index, follow");

    // 3. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalUrl);

    // 4. Open Graph
    updateMeta("property", "og:title", title);
    updateMeta("property", "og:description", description);
    updateMeta("property", "og:url", canonicalUrl);
    updateMeta("property", "og:type", ogType);
    updateMeta("property", "og:image", ogImage);
    updateMeta("property", "og:site_name", "FeatherTown");

    // 5. Twitter Cards
    updateMeta("name", "twitter:card", "summary_large_image");
    updateMeta("name", "twitter:title", title);
    updateMeta("name", "twitter:description", description);
    updateMeta("name", "twitter:image", ogImage);

    // 6. JSON-LD Schema
    const scriptId = "ft-dynamic-jsonld";
    let scriptTag = document.getElementById(scriptId);
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = scriptId;
      scriptTag.type = "application/ld+json";
      document.head.appendChild(scriptTag);
    }

    const defaultSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "PetStore",
          "@id": "https://www.feathertown.online/#store",
          "name": "FeatherTown",
          "url": "https://www.feathertown.online",
          "logo": "https://www.feathertown.online/logo.png",
          "image": "https://www.feathertown.online/og-image.png",
          "description": description,
          "telephone": "+919556747518",
          "email": "support@feathertown.online",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Sundargarh",
            "addressRegion": "Odisha",
            "addressCountry": "IN",
          },
          "priceRange": "₹₹",
        },
        schema || {
          "@type": "WebPage",
          "@id": canonicalUrl,
          "url": canonicalUrl,
          "name": title,
          "description": description,
          "isPartOf": { "@id": "https://www.feathertown.online/#store" },
        },
      ],
    };

    scriptTag.textContent = JSON.stringify(defaultSchema);
  }, [title, description, keywords, ogImage, ogType, canonicalUrl, schema]);

  return null;
}
