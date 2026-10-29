import React from "react";
import { Badge, BadgeVariant } from "./Badge";

export type ProdutoStatus =
  | "PARA_REVISAR"
  | "NO_AR"
  | "PRECO_MUDOU"
  | "OFERTA_ACABOU"
  | "OCULTO"
  | "IGNORADO";

interface StatusConfig {
  texto: string;
  variant: BadgeVariant;
}

const statusMap: Record<ProdutoStatus, StatusConfig> = {
  PARA_REVISAR: { texto: "Para revisar", variant: "info" },
  NO_AR: { texto: "No ar", variant: "success" },
  PRECO_MUDOU: { texto: "Preço mudou", variant: "warning" },
  OFERTA_ACABOU: { texto: "Oferta acabou", variant: "danger" },
  OCULTO: { texto: "Oculto", variant: "neutral" },
  IGNORADO: { texto: "Ignorado", variant: "neutral" },
};

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = statusMap[status as ProdutoStatus] || {
    texto: status,
    variant: "neutral",
  };

  return (
    <Badge variant={config.variant} className={className}>
      {config.texto}
    </Badge>
  );
}

