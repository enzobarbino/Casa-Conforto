"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { podeMudarStatus } from "@/lib/status";
import {
  editarProdutoSchema,
  configuracaoSchema,
  isShopeeUrl,
} from "@/lib/validation";
import { shopeeService } from "@/lib/services/shopee";
import { aiService } from "@/lib/services/ai";

/**
 * Publica um produto que estava PARA_REVISAR
 */
export async function publicarProdutoAction(id: string) {
  await requireAdmin();

  const produto = await prisma.produto.findUnique({ where: { id } });
  if (!produto) return { success: false, error: "Produto não encontrado." };

  if (!podeMudarStatus(produto.status, "NO_AR", "ADMIN")) {
    return { success: false, error: "Transição de status não permitida." };
  }

  await prisma.produto.update({
    where: { id },
    data: {
      status: "NO_AR",
      publicadoEm: produto.publicadoEm ?? new Date(),
    },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Ignora um produto (muda para IGNORADO)
 */
export async function ignorarProdutoAction(id: string) {
  await requireAdmin();

  const produto = await prisma.produto.findUnique({ where: { id } });
  if (!produto) return { success: false, error: "Produto não encontrado." };

  if (!podeMudarStatus(produto.status, "IGNORADO", "ADMIN")) {
    return { success: false, error: "Transição de status não permitida." };
  }

  await prisma.produto.update({
    where: { id },
    data: { status: "IGNORADO" },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Oculta um produto da vitrine (muda para OCULTO)
 */
export async function ocultarProdutoAction(id: string) {
  await requireAdmin();

  const produto = await prisma.produto.findUnique({ where: { id } });
  if (!produto) return { success: false, error: "Produto não encontrado." };

  if (!podeMudarStatus(produto.status, "OCULTO", "ADMIN")) {
    return { success: false, error: "Transição de status não permitida." };
  }

  await prisma.produto.update({
    where: { id },
    data: { status: "OCULTO" },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Mostra um produto oculto novamente na vitrine (muda para NO_AR)
 */
export async function mostrarProdutoAction(id: string) {
  await requireAdmin();

  const produto = await prisma.produto.findUnique({ where: { id } });
  if (!produto) return { success: false, error: "Produto não encontrado." };

  if (!podeMudarStatus(produto.status, "NO_AR", "ADMIN")) {
    return { success: false, error: "Transição de status não permitida." };
  }

  await prisma.produto.update({
    where: { id },
    data: { status: "NO_AR" },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Confirma novo preço após PRECO_MUDOU
 */
export async function confirmarPrecoAction(id: string) {
  await requireAdmin();

  const produto = await prisma.produto.findUnique({ where: { id } });
  if (!produto) return { success: false, error: "Produto não encontrado." };

  if (!podeMudarStatus(produto.status, "NO_AR", "ADMIN")) {
    return { success: false, error: "Transição de status não permitida." };
  }

  await prisma.produto.update({
    where: { id },
    data: {
      status: "NO_AR",
      precoAnterior: null,
    },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Salva edição de produto
 */
export async function salvarProdutoAction(data: {
  id: string;
  titulo: string;
  descricao: string;
  destaques: string[];
  categoria: string;
  publicarAposSalvar?: boolean;
}) {
  await requireAdmin();

  const parsed = editarProdutoSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Dados inválidos.";
    return { success: false, error: errorMsg };
  }

  const produto = await prisma.produto.findUnique({ where: { id: data.id } });
  if (!produto) return { success: false, error: "Produto não encontrado." };

  let novoStatus = produto.status;
  let publicadoEm = produto.publicadoEm;

  if (data.publicarAposSalvar && produto.status === "PARA_REVISAR") {
    if (podeMudarStatus("PARA_REVISAR", "NO_AR", "ADMIN")) {
      novoStatus = "NO_AR";
      publicadoEm = new Date();
    }
  }

  await prisma.produto.update({
    where: { id: data.id },
    data: {
      titulo: data.titulo.trim(),
      descricao: data.descricao.trim(),
      destaques: JSON.stringify(data.destaques.map((d) => d.trim())),
      categoria: data.categoria,
      status: novoStatus,
      publicadoEm,
    },
  });

  revalidatePath("/", "layout");
  return { success: true, novoStatus };
}

/**
 * Regenera textos com IA para um produto
 */
export async function regenerarComIAAction(id: string) {
  await requireAdmin();

  const produto = await prisma.produto.findUnique({ where: { id } });
  if (!produto) return { success: false, error: "Produto não encontrado." };

  let imagens: string[] = [];
  try {
    imagens = JSON.parse(produto.imagens || "[]");
  } catch {
    imagens = [];
  }

  const oferta = {
    shopeeItemId: produto.shopeeItemId,
    nome: produto.titulo,
    descricaoOriginal: produto.descricao,
    preco: produto.precoShopee,
    comissaoPercentual: produto.comissaoPercentual,
    categoria: produto.categoria,
    imagens,
    linkOriginal: produto.linkOriginal,
    disponivel: true,
  };

  const conteudo = await aiService.gerarConteudo(oferta);

  return { success: true, conteudo };
}

/**
 * Adiciona produto colando um link da Shopee
 */
export async function adicionarPorLinkAction(url: string) {
  await requireAdmin();

  if (!isShopeeUrl(url)) {
    return {
      success: false,
      error: "Esse link não parece ser da Shopee. Confira e tente de novo.",
    };
  }

  // 1. Obtém dados do produto
  const oferta = await shopeeService.obterProduto(url);
  if (!oferta) {
    return {
      success: false,
      error: "Não consegui encontrar esse produto. Confira o link.",
    };
  }

  // 2. Verifica se já existe
  const existente = await prisma.produto.findUnique({
    where: { shopeeItemId: oferta.shopeeItemId },
  });
  if (existente) {
    return {
      success: false,
      error: "Esse produto já está na sua lista.",
      produtoId: existente.id,
    };
  }

  // 3. Gera link de afiliado
  const linkAfiliado = await shopeeService.gerarLinkAfiliado(
    oferta.linkOriginal,
    "painel"
  );

  // 4. Gera conteúdo com IA
  const conteudo = await aiService.gerarConteudo(oferta);

  // 5. Salva no banco como PARA_REVISAR
  const novoProduto = await prisma.produto.create({
    data: {
      shopeeItemId: oferta.shopeeItemId,
      titulo: conteudo.titulo,
      descricao: conteudo.descricao,
      destaques: JSON.stringify(conteudo.destaques),
      categoria: conteudo.categoria,
      imagens: JSON.stringify(oferta.imagens),
      precoShopee: oferta.preco,
      precoConsultadoEm: new Date(),
      comissaoPercentual: oferta.comissaoPercentual,
      linkOriginal: oferta.linkOriginal,
      linkAfiliado,
      status: "PARA_REVISAR",
      alertasIA: JSON.stringify(conteudo.alertas),
    },
  });

  revalidatePath("/", "layout");
  return { success: true, produtoId: novoProduto.id };
}

/**
 * Adiciona produto vindo da tela Descobrir
 */
export async function adicionarPorCatalogoAction(shopeeItemId: string) {
  await requireAdmin();

  const existente = await prisma.produto.findUnique({
    where: { shopeeItemId },
  });
  if (existente) {
    return { success: false, error: "Esse produto já está na sua lista." };
  }

  // Busca do mock
  const oferta = await shopeeService.consultarProduto(shopeeItemId);
  if (!oferta) {
    return { success: false, error: "Produto não encontrado." };
  }

  const linkAfiliado = await shopeeService.gerarLinkAfiliado(
    oferta.linkOriginal,
    "descobrir"
  );
  const conteudo = await aiService.gerarConteudo(oferta);

  // Checa se a configuração tem publicar automaticamente ligado
  const config = await prisma.configuracao.findFirst();
  let status = "PARA_REVISAR";
  let publicadoEm: Date | null = null;

  if (
    config?.publicarAutomaticamente &&
    (!conteudo.alertas || conteudo.alertas.length === 0)
  ) {
    status = "NO_AR";
    publicadoEm = new Date();
  }

  const novo = await prisma.produto.create({
    data: {
      shopeeItemId: oferta.shopeeItemId,
      titulo: conteudo.titulo,
      descricao: conteudo.descricao,
      destaques: JSON.stringify(conteudo.destaques),
      categoria: conteudo.categoria,
      imagens: JSON.stringify(oferta.imagens),
      precoShopee: oferta.preco,
      precoConsultadoEm: new Date(),
      comissaoPercentual: oferta.comissaoPercentual,
      linkOriginal: oferta.linkOriginal,
      linkAfiliado,
      status,
      alertasIA: JSON.stringify(conteudo.alertas),
      publicadoEm,
    },
  });

  revalidatePath("/", "layout");
  return { success: true, produtoId: novo.id };
}

/**
 * Alterna a publicação automática
 */
export async function togglePublicarAutomaticamenteAction(valor: boolean) {
  await requireAdmin();

  await prisma.configuracao.upsert({
    where: { id: 1 },
    update: { publicarAutomaticamente: valor },
    create: {
      id: 1,
      categoriasPermitidas: JSON.stringify([
        "cozinha-mesa",
        "conforto-banho",
        "decoracao-aromas",
        "utilidades",
        "organizacao",
      ]),
      frequenciaBusca: "DIARIA",
      publicarAutomaticamente: valor,
    },
  });

  revalidatePath("/painel", "layout");
  return { success: true, valor };
}

/**
 * Salva configurações gerais
 */
export async function salvarConfiguracoesAction(data: {
  categoriasPermitidas: string[];
  frequenciaBusca: "DIARIA" | "A_CADA_2_DIAS" | "SEMANAL";
  publicarAutomaticamente: boolean;
}) {
  await requireAdmin();

  const parsed = configuracaoSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Configurações inválidas.",
    };
  }

  await prisma.configuracao.upsert({
    where: { id: 1 },
    update: {
      categoriasPermitidas: JSON.stringify(data.categoriasPermitidas),
      frequenciaBusca: data.frequenciaBusca,
      publicarAutomaticamente: data.publicarAutomaticamente,
    },
    create: {
      id: 1,
      categoriasPermitidas: JSON.stringify(data.categoriasPermitidas),
      frequenciaBusca: data.frequenciaBusca,
      publicarAutomaticamente: data.publicarAutomaticamente,
    },
  });

  revalidatePath("/painel", "layout");
  return { success: true };
}

