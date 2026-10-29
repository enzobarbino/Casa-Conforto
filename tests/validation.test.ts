import { describe, it, expect } from "vitest";
import { isShopeeUrl } from "@/lib/validation";

describe("Validação de Links da Shopee (validation.ts)", () => {
  it("deve aceitar links válidos da Shopee", () => {
    expect(
      isShopeeUrl("https://shopee.com.br/product/12345/678901")
    ).toBe(true);
    expect(
      isShopeeUrl("https://shp.ee/abc1234")
    ).toBe(true);
    expect(
      isShopeeUrl("http://shopee.com.br/oferta-potes-hermeticos-i.123.456")
    ).toBe(true);
    expect(
      isShopeeUrl("https://loja.shopee.com.br/item-especial")
    ).toBe(true);
  });

  it("deve rejeitar links que não são da Shopee", () => {
    expect(isShopeeUrl("https://mercadolivre.com.br/produto")).toBe(false);
    expect(isShopeeUrl("https://amazon.com.br/dp/B08N5WRWNW")).toBe(false);
    expect(isShopeeUrl("https://google.com")).toBe(false);
    expect(isShopeeUrl("texto-qualquer")).toBe(false);
    expect(isShopeeUrl("")).toBe(false);
  });
});

