import type { MetadataRoute } from "next";
import { appBaseUrl } from "@/lib/email";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/api/", "/register/"],
      },
    ],
    sitemap: `${appBaseUrl()}/sitemap.xml`,
  };
}
