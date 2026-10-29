import { z } from "zod";

export const CATEGORIAS_VALIDAS = [
  "cozinha-mesa",
  "conforto-banho",
  "decoracao-aromas",
  "utilidades",
  "organizacao",
] as const;

export type CategoriaSlug = (typeof CATEGORIAS_VALIDAS)[number];

export const CATEGORIAS_NOMES: Record<CategoriaSlug, string> = {
  "cozinha-mesa": "Cozinha & Mesa",
  "conforto-banho": "Conforto & Banho",
  "decoracao-aromas": "Decoração & Aromas",
  utilidades: "Utilidades Inteligentes",
  organizacao: "Organização & Casa",
};

/**
 * Validação de URL da Shopee (aceita shopee.com.br ou shp.ee)
 */
export function isShopeeUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.toLowerCase();
    return (
      host === "shopee.com.br" ||
      host.endsWith(".shopee.com.br") ||
      host === "shp.ee" ||
      host.endsWith(".shp.ee")
    );
  } catch {
    return false;
  }
}

export const shopeeUrlSchema = z.string().refine(isShopeeUrl, {
  message: "Esse link não parece ser da Shopee. Confira e tente de novo.",
});

export const editarProdutoSchema = z.object({
  id: z.string().min(1, "ID obrigatório"),
  titulo: z
    .string()
    .min(1, "O título é obrigatório.")
    .max(70, "O título pode ter no máximo 70 caracteres."),
  descricao: z
    .string()
    .min(20, "A descrição deve ter pelo menos 20 caracteres."),
  destaques: z
    .array(z.string().min(1, "Destaque não pode ficar em branco").max(40, "Máximo de 40 caracteres por destaque."))
    .length(3, "Devem ser informados exatamente 3 destaques."),
  categoria: z.enum(CATEGORIAS_VALIDAS, {
    message: "Selecione uma categoria válida.",
  }),
});

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido."),
  senha: z.string().min(1, "A senha é obrigatória."),
});

export const configuracaoSchema = z.object({
  categoriasPermitidas: z
    .array(z.enum(CATEGORIAS_VALIDAS))
    .min(1, "Selecione pelo menos uma categoria."),
  frequenciaBusca: z.enum(["DIARIA", "A_CADA_2_DIAS", "SEMANAL"]),
  publicarAutomaticamente: z.boolean(),
});

