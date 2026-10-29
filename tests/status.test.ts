import { describe, it, expect } from "vitest";
import { podeMudarStatus } from "@/lib/status";

describe("Regras de Transição de Status (status.ts)", () => {
  it("deve permitir transições da administradora", () => {
    // PARA_REVISAR -> NO_AR ou IGNORADO
    expect(podeMudarStatus("PARA_REVISAR", "NO_AR", "ADMIN")).toBe(true);
    expect(podeMudarStatus("PARA_REVISAR", "IGNORADO", "ADMIN")).toBe(true);

    // NO_AR <-> OCULTO
    expect(podeMudarStatus("NO_AR", "OCULTO", "ADMIN")).toBe(true);
    expect(podeMudarStatus("OCULTO", "NO_AR", "ADMIN")).toBe(true);

    // PRECO_MUDOU -> NO_AR (confirmar preço)
    expect(podeMudarStatus("PRECO_MUDOU", "NO_AR", "ADMIN")).toBe(true);
    expect(podeMudarStatus("PRECO_MUDOU", "OCULTO", "ADMIN")).toBe(true);

    // Mesmo status é sempre permitido
    expect(podeMudarStatus("NO_AR", "NO_AR", "ADMIN")).toBe(true);
  });

  it("deve proibir transições manuais não autorizadas para a administradora", () => {
    // Administradora não pode forçar OFERTA_ACABOU diretamente
    expect(podeMudarStatus("NO_AR", "OFERTA_ACABOU", "ADMIN")).toBe(false);
    // Administradora não pode reverter IGNORADO para NO_AR
    expect(podeMudarStatus("IGNORADO", "NO_AR", "ADMIN")).toBe(false);
    // Não pode pular de PARA_REVISAR para PRECO_MUDOU
    expect(podeMudarStatus("PARA_REVISAR", "PRECO_MUDOU", "ADMIN")).toBe(false);
  });

  it("deve permitir transições da rotina de atualização", () => {
    // NO_AR -> PRECO_MUDOU ou OFERTA_ACABOU
    expect(podeMudarStatus("NO_AR", "PRECO_MUDOU", "ROTINA")).toBe(true);
    expect(podeMudarStatus("NO_AR", "OFERTA_ACABOU", "ROTINA")).toBe(true);

    // OFERTA_ACABOU -> NO_AR (quando volta estoque)
    expect(podeMudarStatus("OFERTA_ACABOU", "NO_AR", "ROTINA")).toBe(true);
  });
});

