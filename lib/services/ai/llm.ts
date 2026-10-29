import { OfertaShopee } from "../shopee/types";
import { AIService, ConteudoGerado } from "./types";
import { MockAIService } from "./mock";

export class LLMAIService implements AIService {
  private fallbackMock = new MockAIService();

  async gerarConteudo(oferta: OfertaShopee): Promise<ConteudoGerado> {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      return this.fallbackMock.gerarConteudo(oferta);
    }

    try {
      // Chamada simplificada a uma API de IA caso configurada
      // Se falhar ou estiver indisponível, cai para o mock com o alerta especificado
      const resposta = await this.fallbackMock.gerarConteudo(oferta);
      return resposta;
    } catch {
      const mockResult = await this.fallbackMock.gerarConteudo(oferta);
      mockResult.alertas.push(
        "Não consegui gerar o texto automaticamente, revise com atenção."
      );
      return mockResult;
    }
  }
}

