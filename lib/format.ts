/**
 * Utilitários de formatação para o Casa & Conforto.
 * Moeda em R$ e datas em dd/mm/aaaa.
 */

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function formatarData(data: Date | string | number): string {
  const d = typeof data === "object" ? data : new Date(data);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatarDataHora(data: Date | string | number): string {
  const d = typeof data === "object" ? data : new Date(data);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatarNumero(valor: number): string {
  return new Intl.NumberFormat("pt-BR").format(valor);
}

export function formatarPercentual(valor: number): string {
  // Exemplo: 0.12 -> 12%
  return `${Math.round(valor * 100)}%`;
}

