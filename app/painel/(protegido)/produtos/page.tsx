import React, { Suspense } from "react";
import { prisma } from "@/lib/db";
import { MeusProdutosClient, ItemMeuProduto } from "@/components/painel/MeusProdutosClient";

function getSeteDiasAtras(): Date {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}

export default async function MeusProdutosPage() {
  const seteDiasAtras = getSeteDiasAtras();

  // Busca todos os produtos que não estejam com status IGNORADO
  const produtos = await prisma.produto.findMany({
    where: {
      status: { not: "IGNORADO" },
    },
    include: {
      cliques: {
        select: {
          id: true,
          criadoEm: true,
        },
      },
    },
    orderBy: {
      criadoEm: "desc",
    },
  });

  // Contagens por aba
  const counts = {
    todos: produtos.length,
    noAr: produtos.filter((p) => p.status === "NO_AR").length,
    precoMudou: produtos.filter((p) => p.status === "PRECO_MUDOU").length,
    ofertaAcabou: produtos.filter((p) => p.status === "OFERTA_ACABOU").length,
    ocultos: produtos.filter((p) => p.status === "OCULTO").length,
  };

  const lista: ItemMeuProduto[] = produtos.map((p) => {
    let imagens: string[] = [];
    try {
      imagens = JSON.parse(p.imagens || "[]");
    } catch {
      imagens = [];
    }

    const cliquesSemana = p.cliques.filter(
      (c) => new Date(c.criadoEm).getTime() >= seteDiasAtras.getTime()
    ).length;

    return {
      id: p.id,
      titulo: p.titulo,
      precoShopee: p.precoShopee,
      precoAnterior: p.precoAnterior,
      categoria: p.categoria,
      imagens,
      status: p.status,
      cliquesTotal: p.cliques.length,
      cliquesSemana,
      publicadoEm: p.publicadoEm ? p.publicadoEm.toISOString() : null,
    };
  });

  return (
    <Suspense fallback={<div className="p-8 text-center text-text-muted">Carregando produtos...</div>}>
      <MeusProdutosClient initialProducts={lista} counts={counts} />
    </Suspense>
  );
}

