export type StatusProduto =
  | "PARA_REVISAR"
  | "NO_AR"
  | "PRECO_MUDOU"
  | "OFERTA_ACABOU"
  | "OCULTO"
  | "IGNORADO";

/**
 * Valida se uma transição de status é permitida pelo modelo de negócios.
 */
export function podeMudarStatus(
  de: string,
  para: string,
  origem: "ADMIN" | "ROTINA" = "ADMIN"
): boolean {
  if (de === para) return true;

  if (origem === "ADMIN") {
    // Ações manuais da administradora:
    // PARA_REVISAR -> NO_AR (publicar) ou IGNORADO (ignorar)
    if (de === "PARA_REVISAR" && (para === "NO_AR" || para === "IGNORADO")) {
      return true;
    }
    // NO_AR <-> OCULTO (ocultar / mostrar)
    if (de === "NO_AR" && para === "OCULTO") return true;
    if (de === "OCULTO" && para === "NO_AR") return true;
    // PRECO_MUDOU -> NO_AR (confirmar novo preço)
    if (de === "PRECO_MUDOU" && para === "NO_AR") return true;
    // PRECO_MUDOU -> OCULTO (ocultar)
    if (de === "PRECO_MUDOU" && para === "OCULTO") return true;
    return false;
  }

  if (origem === "ROTINA") {
    // Rotina automática de atualização:
    // NO_AR -> PRECO_MUDOU ou OFERTA_ACABOU
    if (de === "NO_AR" && (para === "PRECO_MUDOU" || para === "OFERTA_ACABOU")) {
      return true;
    }
    // PRECO_MUDOU -> OFERTA_ACABOU ou NO_AR
    if (de === "PRECO_MUDOU" && (para === "OFERTA_ACABOU" || para === "NO_AR")) {
      return true;
    }
    // OFERTA_ACABOU -> NO_AR (oferta voltou a ficar disponível)
    if (de === "OFERTA_ACABOU" && (para === "NO_AR" || para === "PRECO_MUDOU")) {
      return true;
    }
    return false;
  }

  return false;
}

