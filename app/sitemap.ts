import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.SITE_URL || "http://localhost:3000";

  // Rotas estáticas
  const rotasFixas: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/produtos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/bio`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/sobre`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacidade`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Páginas de produtos visíveis
  const produtos = await prisma.produto.findMany({
    where: {
      status: { in: ["NO_AR", "PRECO_MUDOU"] },
    },
    select: {
      id: true,
      atualizadoEm: true,
    },
  });

  const rotasProdutos: MetadataRoute.Sitemap = produtos.map((p) => ({
    url: `${siteUrl}/produtos/${p.id}`,
    lastModified: p.atualizadoEm,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...rotasFixas, ...rotasProdutos];
}

