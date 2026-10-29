import React from "react";
import { prisma } from "@/lib/db";
import { ConfiguracoesClient } from "@/components/painel/ConfiguracoesClient";

export default async function ConfiguracoesPage() {
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

  const initialConfig = {
    categoriasPermitidas,
    frequenciaBusca:
      (config?.frequenciaBusca as "DIARIA" | "A_CADA_2_DIAS" | "SEMANAL") ||
      "DIARIA",
    publicarAutomaticamente: config?.publicarAutomaticamente ?? false,
  };

  return <ConfiguracoesClient initialConfig={initialConfig} />;
}

