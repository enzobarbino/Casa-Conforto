export interface OfertaShopee {
  shopeeItemId: string;
  nome: string;
  descricaoOriginal: string;
  preco: number;
  comissaoPercentual: number;
  categoria: string;
  imagens: string[];
  linkOriginal: string;
  disponivel: boolean;
}

export interface ShopeeService {
  buscarOfertas(params: {
    termo?: string;
    categorias?: string[];
    limite?: number;
  }): Promise<OfertaShopee[]>;
  obterProduto(url: string): Promise<OfertaShopee | null>;
  gerarLinkAfiliado(linkOriginal: string, subId?: string): Promise<string>;
  consultarProduto(shopeeItemId: string): Promise<OfertaShopee | null>;
}

