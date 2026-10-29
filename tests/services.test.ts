import { describe, it, expect } from "vitest";
import { MockShopeeService } from "@/lib/services/shopee/mock";
import { MockAIService } from "@/lib/services/ai/mock";
import { CATEGORIAS_VALIDAS, CategoriaSlug } from "@/lib/validation";

describe("Serviços Simulados (Shopee e IA)", () => {
  const shopeeService = new MockShopeeService();
  const aiService = new MockAIService();

  it("ShopeeService: busca por termo sem diferenciar acentos ou maiúsculas", async () => {
    // Busca por "potes" sem acento deve encontrar produtos de potes
    const resPotes = await shopeeService.buscarOfertas({ termo: "POTES" });
    expect(resPotes.length).toBeGreaterThan(0);
    expect(resPotes[0].nome.toLowerCase()).toContain("potes");

    // Busca por "termico" sem acento deve encontrar "térmico"
    const resTermico = await shopeeService.buscarOfertas({ termo: "termico" });
    expect(resTermico.length).toBeGreaterThan(0);
    expect(resTermico.some((i) => i.nome.toLowerCase().includes("térmico"))).toBe(true);
  });

  it("ShopeeService: filtra corretamente por categoria", async () => {
    const res = await shopeeService.buscarOfertas({
      categorias: ["cozinha-mesa"],
    });
    expect(res.length).toBeGreaterThan(0);
    for (const item of res) {
      expect(item.categoria).toBe("cozinha-mesa");
    }
  });

  it("ShopeeService: gera link de afiliado com formato esperado", async () => {
    const link = await shopeeService.gerarLinkAfiliado(
      "https://shopee.com.br/produto-teste",
      "whatsapp"
    );
    expect(link).toContain("af_id=DEMO");
    expect(link).toContain("sub_id=whatsapp");
  });

  it("AIService: sempre retorna exatamente 3 destaques e categoria válida", async () => {
    const ofertaFicticia = {
      shopeeItemId: "shopee-test-1",
      nome: "Jogo de Panelas Antiaderente Cerâmica Premium 5 Peças",
      descricaoOriginal: "Conjunto completo com tampas de vidro temperado e cabos antitérmicos.",
      preco: 199.9,
      comissaoPercentual: 0.12,
      categoria: "cozinha-mesa",
      imagens: ["/produtos/frigideira-ceramica.svg"],
      linkOriginal: "https://shopee.com.br/produto-teste",
      disponivel: true,
    };

    const conteudo = await aiService.gerarConteudo(ofertaFicticia);

    // Título até 70 caracteres
    expect(conteudo.titulo.length).toBeLessThanOrEqual(70);
    // Exatamente 3 destaques
    expect(conteudo.destaques.length).toBe(3);
    for (const d of conteudo.destaques) {
      expect(d.length).toBeLessThanOrEqual(40);
      expect(d.trim().length).toBeGreaterThan(0);
    }
    // Categoria válida
    expect(CATEGORIAS_VALIDAS.includes(conteudo.categoria as CategoriaSlug)).toBe(true);
    // Descrição não vazia
    expect(conteudo.descricao.trim().length).toBeGreaterThan(30);
  });
});

