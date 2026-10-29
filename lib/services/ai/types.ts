import { OfertaShopee } from "../shopee/types";

export interface ConteudoGerado {
  titulo: string;        // até 70 caracteres
  descricao: string;     // 60 a 120 palavras
  destaques: string[];   // exatamente 3, até 40 caracteres cada
  categoria: string;     // slug válido da seção 7.3
  alertas: string[];     // informações faltando ou duvidosas
}

export interface AIService {
  gerarConteudo(oferta: OfertaShopee): Promise<ConteudoGerado>;
}

