import React, { Suspense } from "react";
import { prisma } from "@/lib/db";
import { CatalogClient, CatalogProduct } from "@/components/vitrine/CatalogClient";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";

export default async function ProdutosPage() {
  // Busca todos os produtos visíveis
  const produtos = await prisma.produto.findMany({
    where: {
      status: { in: ["NO_AR", "PRECO_MUDOU"] },
    },
    include: {
      cliques: {
        select: { id: true },
      },
    },
    orderBy: {
      publicadoEm: "desc",
    },
  });

  // Calcula a contagem por categoria
  const categoryCounts: Record<string, number> = {};
  for (const p of produtos) {
    categoryCounts[p.categoria] = (categoryCounts[p.categoria] || 0) + 1;
  }

  const catalogProducts: CatalogProduct[] = produtos.map((p) => {
    let imagens: string[] = [];
    try {
      imagens = JSON.parse(p.imagens || "[]");
    } catch {
      imagens = [];
    }

    return {
      id: p.id,
      titulo: p.titulo,
      precoShopee: p.precoShopee,
      precoAnterior: p.precoAnterior,
      categoria: p.categoria,
      imagens: imagens.length > 0 ? imagens : ["/produtos/potes-hermeticos.svg"],
      status: p.status,
      cliquesCount: p.cliques.length,
      publicadoEm: p.publicadoEm ? p.publicadoEm.toISOString() : null,
    };
  });

  return (
    <Suspense
      fallback={
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
        </div>
      }
    >
      <CatalogClient
        initialProducts={catalogProducts}
        categoryCounts={categoryCounts}
      />
    </Suspense>
  );
}
