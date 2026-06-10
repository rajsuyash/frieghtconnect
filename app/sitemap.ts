import type { MetadataRoute } from "next";
import { appBaseUrl } from "@/lib/email";
import { listApprovedForwarderSlugs } from "@/lib/forwarders/repository";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = appBaseUrl();
  const profiles = await listApprovedForwarderSlugs();

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/forwarders`, changeFrequency: "daily", priority: 0.9 },
    ...profiles.map((p) => ({
      url: `${base}/forwarders/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
