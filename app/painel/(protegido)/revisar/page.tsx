import React from "react";
import { prisma } from "@/lib/db";
import { RevisarClient, RevisarProdutoItem } from "@/components/painel/RevisarClient";

export default async function RevisarPage() {
  const produtos = await prisma.produto.findMany({
    where: { status: "PARA_REVISAR" },
    orderBy: { criadoEm: "desc" },
  });

  const config = await prisma.configuracao.findFirst();

  const items: RevisarProdutoItem[] = produtos.map((p) => {
    let imagens: string[] = [];
    try {
      imagens = JSON.parse(p.imagens || "[]");
    } catch {
      imagens = [];
    }

    let alertasIA: string[] = [];
    try {
      alertasIA = JSON.parse(p.alertasIA || "[]");
    } catch {
      alertasIA = [];
    }

    return {
      id: p.id,
      titulo: p.titulo,
      descricao: p.descricao,
      precoShopee: p.precoShopee,
      comissaoPercentual: p.comissaoPercentual,
      categoria: p.categoria,
      imagens,
      alertasIA,
    };
  });

  return (
    <RevisarClient
      initialItems={items}
      initialPublicarAuto={config?.publicarAutomaticamente ?? false}
    />
  );
}

