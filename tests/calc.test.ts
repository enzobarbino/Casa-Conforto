import { describe, it, expect } from "vitest";
import {
  calcularGanhoEstimado,
  calcularMetricasCliques,
  somarComissoes,
  contarProdutosNoAr,
} from "@/lib/calc";

describe("Cálculos e Métricas (calc.ts)", () => {
  it("deve calcular o ganho estimado por venda com arredondamento a 2 casas", () => {
    // 89.90 * 0.12 = 10.788 -> 10.79
    expect(calcularGanhoEstimado(89.9, 0.12)).toBe(10.79);
    // 45.00 * 0.10 = 4.5
    expect(calcularGanhoEstimado(45.0, 0.1)).toBe(4.5);
    // 0 * qualquer = 0
    expect(calcularGanhoEstimado(0, 0.15)).toBe(0);
  });

  it("deve calcular as métricas de cliques da semana e a variação percentual", () => {
    // Aumento de 100 para 150 = +50%
    const res1 = calcularMetricasCliques(150, 100);
    expect(res1.cliquesAtuais).toBe(150);
    expect(res1.variacaoPercentual).toBe(50);

    // Queda de 100 para 80 = -20%
    const res2 = calcularMetricasCliques(80, 100);
    expect(res2.variacaoPercentual).toBe(-20);

    // Semana anterior com 0 cliques e atual com 50 = +100%
    const res3 = calcularMetricasCliques(50, 0);
    expect(res3.variacaoPercentual).toBe(100);

    // Ambos com 0 cliques = 0%
    const res4 = calcularMetricasCliques(0, 0);
    expect(res4.variacaoPercentual).toBe(0);
  });

  it("deve somar comissões pendentes e confirmadas separadamente", () => {
    const comissoes = [
      { valor: 10.5, status: "PENDENTE" },
      { valor: 20.25, status: "PENDENTE" },
      { valor: 50.0, status: "CONFIRMADA" },
      { valor: 12.3, status: "CONFIRMADA" },
    ];

    expect(somarComissoes(comissoes, "PENDENTE")).toBe(30.75);
    expect(somarComissoes(comissoes, "CONFIRMADA")).toBe(62.3);
  });

  it("deve contar apenas produtos no ar (NO_AR e PRECO_MUDOU)", () => {
    const produtos = [
      { status: "NO_AR" },
      { status: "NO_AR" },
      { status: "PRECO_MUDOU" },
      { status: "PARA_REVISAR" },
      { status: "OFERTA_ACABOU" },
      { status: "OCULTO" },
      { status: "IGNORADO" },
    ];

    expect(contarProdutosNoAr(produtos)).toBe(3);
  });
});

