import type { MetadataRoute } from "next";

import { allProperties } from "@/lib/properties";

const baseUrl = "https://eain-myanmar-homes.brooks109.chatgpt.site";

export default function sitemap(): MetadataRoute.Sitemap {
  const coreRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/search`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/assistant`, changeFrequency: "monthly", priority: 0.7 },
  ];

  return [
    ...coreRoutes,
    ...allProperties.map((property) => ({
      url: `${baseUrl}/properties/${property.id}`,
      changeFrequency: "weekly" as const,
      priority: property.verification_status === "verified" ? 0.8 : 0.6,
    })),
  ];
}
