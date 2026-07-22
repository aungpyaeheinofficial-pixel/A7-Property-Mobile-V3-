import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://eain-myanmar-homes.brooks109.chatgpt.site";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/owner", "/agent"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
