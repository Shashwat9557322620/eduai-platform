import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://eduai.vercel.app";
  const pages = [
    "", "/optimizer", "/flashcards", "/analyzer",
    "/about", "/blog", "/faq",
    "/privacy-policy", "/terms-of-service", "/refund-policy",
    "/billing",
  ];

  const blogPosts = [
    "/blog/ai-study-tips-2025",
    "/blog/curriculum-optimization-guide",
    "/blog/flashcard-memory-retention",
    "/blog/skill-gap-analysis-career",
  ];

  const allRoutes = [...pages, ...blogPosts];

  return allRoutes.map(route => ({
    url: baseUrl + route,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" as const : "monthly" as const,
    priority: route === "" ? 1 : route.startsWith("/blog/") ? 0.7 : 0.8,
  }));
}
