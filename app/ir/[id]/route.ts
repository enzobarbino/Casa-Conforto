import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. Busca o produto
  const produto = await prisma.produto.findUnique({
    where: { id },
  });

  // Se não existir ou o status não for NO_AR ou PRECO_MUDOU, redireciona para a página do produto
  if (!produto || (produto.status !== "NO_AR" && produto.status !== "PRECO_MUDOU")) {
    const siteUrl = process.env.SITE_URL || "http://localhost:3000";
    return NextResponse.redirect(new URL(`/produtos/${id}`, siteUrl), 302);
  }

  // 2. Lê origem da query (site | whatsapp | bio)
  const searchParams = request.nextUrl.searchParams;
  const rawOrigem = searchParams.get("origem")?.toLowerCase() || "site";
  const origem = ["site", "whatsapp", "bio"].includes(rawOrigem)
    ? rawOrigem
    : "site";

  // 5. Detecta robôs / crawlers / whatsapp preview
  const userAgent = request.headers.get("user-agent")?.toLowerCase() || "";
  const isBot =
    userAgent.includes("bot") ||
    userAgent.includes("crawler") ||
    userAgent.includes("spider") ||
    userAgent.includes("facebookexternalhit");

  // 3. Registra clique se não for robô
  if (!isBot) {
    try {
      await prisma.clique.create({
        data: {
          produtoId: produto.id,
          origem,
        },
      });
    } catch (e) {
      console.error("Erro ao registrar clique:", e);
    }
  }

  // 4. Redireciona 302 para o linkAfiliado seguro gravado no banco de dados
  return NextResponse.redirect(produto.linkAfiliado, 302);
}

