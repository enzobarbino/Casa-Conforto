import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { EditarProdutoClient } from "@/components/painel/EditarProdutoClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarProdutoPage({ params }: PageProps) {
  const { id } = await params;

  const produto = await prisma.produto.findUnique({
    where: { id },
  });

  if (!produto) {
    notFound();
  }

  let imagens: string[] = [];
  try {
    imagens = JSON.parse(produto.imagens || "[]");
  } catch {
    imagens = [];
  }

  let destaques: string[] = [];
  try {
    destaques = JSON.parse(produto.destaques || "[]");
  } catch {
    destaques = [];
  }

  let alertasIA: string[] = [];
  try {
    alertasIA = JSON.parse(produto.alertasIA || "[]");
  } catch {
    alertasIA = [];
  }

  const produtoSerializado = {
    id: produto.id,
    shopeeItemId: produto.shopeeItemId,
    titulo: produto.titulo,
    descricao: produto.descricao,
    destaques,
    categoria: produto.categoria,
    imagens,
    precoShopee: produto.precoShopee,
    precoAnterior: produto.precoAnterior,
    precoConsultadoEm: produto.precoConsultadoEm.toISOString(),
    comissaoPercentual: produto.comissaoPercentual,
    linkOriginal: produto.linkOriginal,
    status: produto.status,
    alertasIA,
  };

  return <EditarProdutoClient produto={produtoSerializado} />;
}

