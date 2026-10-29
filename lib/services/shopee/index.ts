import { ShopeeService } from "./types";
import { MockShopeeService } from "./mock";

// TODO: implementação real via Shopee Affiliate Open API quando credenciais reais forem configuradas

const mockService = new MockShopeeService();

export function getShopeeService(): ShopeeService {
  // Atualmente suporta SHOPEE_MODE="mock" (padrão)
  return mockService;
}

export const shopeeService = getShopeeService();
export * from "./types";

