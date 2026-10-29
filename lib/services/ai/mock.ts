import { OfertaShopee } from "../shopee/types";
import { AIService, ConteudoGerado } from "./types";
import { CATEGORIAS_VALIDAS, CategoriaSlug } from "@/lib/validation";

function delay(ms: number): Promise<void> {
  if (process.env.NODE_ENV === "test") return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockAIService implements AIService {
  async gerarConteudo(oferta: OfertaShopee): Promise<ConteudoGerado> {
    await delay(500);

    const alertas: string[] = [];

    // Checagem de descrição curta
    if (!oferta.descricaoOriginal || oferta.descricaoOriginal.length < 80) {
      alertas.push("Descrição original muito curta; confira dimensões e material.");
    }

    // Título refinado (até 70 caracteres)
    let titulo = oferta.nome.trim();
    if (titulo.length > 70) {
      // Abrevia ou corta no último espaço antes de 67 caracteres
      const cortado = titulo.slice(0, 67);
      titulo = cortado.slice(0, cortado.lastIndexOf(" ")) + "...";
    }

    // Categoria válida
    let categoria: CategoriaSlug = "utilidades";
    if (CATEGORIAS_VALIDAS.includes(oferta.categoria as CategoriaSlug)) {
      categoria = oferta.categoria as CategoriaSlug;
    } else {
      alertas.push("Categoria identificada automaticamente com base nas palavras-chave.");
    }

    // 3 destaques curtos (até 40 caracteres cada)
    const destaques: string[] = [
      "Praticidade pensada para o dia a dia",
      "Material resistente e durável",
      "Excelente custo-benefício comprovado",
    ];

    // Ajusta destaques com base no nome
    const nomeBaixo = oferta.nome.toLowerCase();
    if (nomeBaixo.includes("inox") || nomeBaixo.includes("aço")) {
      destaques[1] = "Aço de alta resistência antiferrugem";
    } else if (nomeBaixo.includes("bambu")) {
      destaques[1] = "Bambu natural bactericida e ecológico";
    } else if (nomeBaixo.includes("silicone")) {
      destaques[1] = "Silicone flexível de fácil higienização";
    } else if (nomeBaixo.includes("vidro")) {
      destaques[1] = "Vidro resistente e livre de odores";
    }

    if (nomeBaixo.includes("sensor") || nomeBaixo.includes("automátic")) {
      destaques[0] = "Sensor inteligente de alta sensibilidade";
    } else if (nomeBaixo.includes("impermeável") || nomeBaixo.includes("lavável")) {
      destaques[0] = "Fácil limpeza e manutenção simples";
    } else if (nomeBaixo.includes("recarregável") || nomeBaixo.includes("usb")) {
      destaques[0] = "Bateria recarregável via USB rápida";
    }

    // Garante que cada destaque tenha até 40 caracteres
    const destaquesFormatados = destaques.slice(0, 3).map((d) =>
      d.length > 40 ? d.slice(0, 37) + "..." : d
    );

    // Descrição acolhedora entre 60 e 120 palavras
    const paragrafo1 = `Uma escolha pensada para transformar o conforto e a praticidade da sua casa no dia a dia. ${oferta.nome} foi desenvolvido para quem busca aliar funcionalidade, beleza e organização de maneira descomplicada e muito eficiente.`;
    const paragrafo2 = `Com acabamento cuidadoso e materiais selecionados, proporciona excelente durabilidade e encaixa perfeitamente na sua rotina, trazendo mais bem-estar para o seu lar. Uma daquelas compras inteligentes que fazem toda a diferença nos pequenos detalhes da casa.`;

    const descricao = `${paragrafo1} ${paragrafo2}`;

    return {
      titulo,
      descricao,
      destaques: destaquesFormatados,
      categoria,
      alertas,
    };
  }
}

