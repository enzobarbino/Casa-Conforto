import fs from "fs";
import path from "path";
import { OfertaShopee, ShopeeService } from "./types";
import { isShopeeUrl } from "@/lib/validation";

function delay(ms: number): Promise<void> {
  if (process.env.NODE_ENV === "test") return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizar(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export class MockShopeeService implements ShopeeService {
  private catalogo: OfertaShopee[] = [];

  constructor() {
    this.carregarCatalogo();
  }

  private carregarCatalogo() {
    try {
      const filePath = path.join(
        process.cwd(),
        "prisma/data/catalogo-shopee-mock.json"
      );
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, "utf8");
        this.catalogo = JSON.parse(data);
      }
    } catch (e) {
      console.error("Erro ao carregar catalogo-shopee-mock.json:", e);
      this.catalogo = [];
    }
  }

  async buscarOfertas(params: {
    termo?: string;
    categorias?: string[];
    limite?: number;
  }): Promise<OfertaShopee[]> {
    await delay(350);

    let resultados = [...this.catalogo].filter((item) => item.disponivel);

    if (params.categorias && params.categorias.length > 0) {
      resultados = resultados.filter((item) =>
        params.categorias!.includes(item.categoria)
      );
    }

    if (params.termo && params.termo.trim()) {
      const termoNorm = normalizar(params.termo.trim());
      resultados = resultados.filter((item) => {
        const nomeNorm = normalizar(item.nome);
        const descNorm = normalizar(item.descricaoOriginal);
        return nomeNorm.includes(termoNorm) || descNorm.includes(termoNorm);
      });
    }

    // Ordenar por comissão decrescente
    resultados.sort((a, b) => b.comissaoPercentual - a.comissaoPercentual);

    if (params.limite && params.limite > 0) {
      resultados = resultados.slice(0, params.limite);
    }

    return resultados;
  }

  async obterProduto(url: string): Promise<OfertaShopee | null> {
    await delay(450);

    if (!isShopeeUrl(url)) {
      return null;
    }

    // Tenta casar com ID existente no catálogo mock
    for (const item of this.catalogo) {
      if (url.includes(item.shopeeItemId) || item.linkOriginal === url) {
        return item;
      }
    }

    // Se a URL contém shopee.com.br/product/... ou similar
    const match = url.match(/\/(\d+)\/(\d+)/);
    if (match) {
      const shopeeItemId = `shopee-item-${match[2] || match[1]}`;
      const achado = this.catalogo.find((c) => c.shopeeItemId === shopeeItemId);
      if (achado) return achado;
    }

    // Se for link da Shopee válido mas não está no catálogo, gera uma oferta fictícia determinística
    // para que qualquer link válido funcione na demonstração
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = (hash << 5) - hash + url.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);
    const idSufixo = (absHash % 90000) + 10000;
    const preco = Number(((absHash % 15000) / 100 + 29.9).toFixed(2));
    const comissoes = [0.1, 0.12, 0.14, 0.15, 0.18];
    const comissao = comissoes[absHash % comissoes.length];

    const categoriasPossiveis = [
      "cozinha-mesa",
      "conforto-banho",
      "decoracao-aromas",
      "utilidades",
      "organizacao",
    ];
    const categoria = categoriasPossiveis[absHash % categoriasPossiveis.length];

    // Escolhe uma imagem existente no mock
    const imagensDisponiveis = [
      "/produtos/potes-hermeticos.svg",
      "/produtos/luminaria-sensor.svg",
      "/produtos/difusor-chama.svg",
      "/produtos/organizador-colmeia.svg",
      "/produtos/tapete-absorvente.svg",
    ];
    const imagem = imagensDisponiveis[absHash % imagensDisponiveis.length];

    return {
      shopeeItemId: `shopee-link-${idSufixo}`,
      nome: `Achado Especial de Casa - Ref ${idSufixo}`,
      descricaoOriginal: `Produto de alta utilidade e praticidade para o lar. Design funcional e moderno, ideal para melhorar a rotina diária com conforto e praticidade. Fabricação em materiais selecionados com excelente durabilidade.`,
      preco,
      comissaoPercentual: comissao,
      categoria,
      imagens: [imagem],
      linkOriginal: url.trim(),
      disponivel: true,
    };
  }

  async gerarLinkAfiliado(linkOriginal: string, subId: string = "site"): Promise<string> {
    const separator = linkOriginal.includes("?") ? "&" : "?";
    return `${linkOriginal}${separator}af_id=DEMO&sub_id=${encodeURIComponent(subId)}`;
  }

  async consultarProduto(shopeeItemId: string): Promise<OfertaShopee | null> {
    await delay(300);

    const produto = this.catalogo.find((p) => p.shopeeItemId === shopeeItemId);
    if (!produto) {
      return null;
    }

    const copia = { ...produto };

    // Variações aleatórias simuladas:
    // ~5% de chance de oferta encerrada (disponivel: false)
    const randomDisp = Math.random();
    if (randomDisp < 0.05) {
      copia.disponivel = false;
      return copia;
    }

    // ~15% de chance de mudar o preço (±5% a 20%)
    const randomPreco = Math.random();
    if (randomPreco < 0.15) {
      const deltaPercent = (Math.random() * 0.25 - 0.1); // entre -10% e +15%
      copia.preco = Number(Math.max(10, copia.preco * (1 + deltaPercent)).toFixed(2));
    }

    return copia;
  }
}

