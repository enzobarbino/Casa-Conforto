/**
 * Cálculos e métricas do Casa & Conforto.
 */

export function calcularGanhoEstimado(precoShopee: number, comissaoPercentual: number): number {
  return Number((precoShopee * comissaoPercentual).toFixed(2));
}

export interface MetricasSemana {
  cliquesAtuais: number;
  cliquesAnteriores: number;
  variacaoPercentual: number; // ex: 15 para +15%, -10 para -10%
}

export function calcularMetricasCliques(
  cliquesUltimos7Dias: number,
  cliques7DiasAnteriores: number
): MetricasSemana {
  let variacaoPercentual = 0;

  if (cliques7DiasAnteriores === 0) {
    variacaoPercentual = cliquesUltimos7Dias > 0 ? 100 : 0;
  } else {
    variacaoPercentual = Number(
      (((cliquesUltimos7Dias - cliques7DiasAnteriores) / cliques7DiasAnteriores) * 100).toFixed(1)
    );
  }

  return {
    cliquesAtuais: cliquesUltimos7Dias,
    cliquesAnteriores: cliques7DiasAnteriores,
    variacaoPercentual,
  };
}

export function somarComissoes(
  comissoes: Array<{ valor: number; status: string }>,
  statusDesejado: "PENDENTE" | "CONFIRMADA"
): number {
  const total = comissoes
    .filter((c) => c.status === statusDesejado)
    .reduce((acc, curr) => acc + curr.valor, 0);
  return Number(total.toFixed(2));
}

export function contarProdutosNoAr(
  produtos: Array<{ status: string }>
): number {
  return produtos.filter(
    (p) => p.status === "NO_AR" || p.status === "PRECO_MUDOU"
  ).length;
}

