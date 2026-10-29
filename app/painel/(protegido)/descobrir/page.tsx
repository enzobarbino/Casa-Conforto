import React from "react";
import { prisma } from "@/lib/db";
import { shopeeService } from "@/lib/services/shopee";
import { DescobrirClient } from "@/components/painel/DescobrirClient";

export default async function DescobrirPage() {
  const config = await prisma.configuracao.findFirst();

  let categoriasPermitidas = [
    "cozinha-mesa",
    "conforto-banho",
    "decoracao-aromas",
    "utilidades",
    "organizacao",
  ];

  if (config?.categoriasPermitidas) {
    try {
      categoriasPermitidas = JSON.parse(config.categoriasPermitidas);
    } catch {}
  }

  // Busca ofertas do serviço Shopee
  const ofertas = await shopeeService.buscarOfertas({
    categorias: categoriasPermitidas,
    limite: 30,
  });

  // Busca IDs já cadastrados no banco
  const produtosNoBanco = await prisma.produto.findMany({
    select: { shopeeItemId: true },
  });
  const idsNoBanco = produtosNoBanco.map((p) => p.shopeeItemId);

  return (
    <DescobrirClient
      initialOffers={ofertas}
      idsNoBanco={idsNoBanco}
      categoriasPermitidas={categoriasPermitidas}
    />
  );
}

