import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatarMoeda, formatarData } from "@/lib/format";
import { CATEGORIAS_NOMES, CategoriaSlug } from "@/lib/validation";
import { ProductGallery } from "@/components/vitrine/ProductGallery";
import { ProductCard } from "@/components/vitrine/ProductCard";
import { StickyMobileBar } from "@/components/vitrine/StickyMobileBar";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import {
  ExternalLink,
  Share2,
  CheckCircle2,
  AlertOctagon,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const produto = await prisma.produto.findUnique({
    where: { id },
  });

  if (!produto || ["OCULTO", "IGNORADO", "PARA_REVISAR"].includes(produto.status)) {
    return {
      title: "Produto não encontrado | Casa & Conforto",
    };
  }

  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  let imagens: string[] = [];
  try {
    imagens = JSON.parse(produto.imagens || "[]");
  } catch {
    imagens = [];
  }
  const imagemUrl = imagens[0] ? `${siteUrl}${imagens[0]}` : undefined;

  return {
    title: `${produto.titulo} | Casa & Conforto`,
    description: produto.descricao.slice(0, 160),
    openGraph: {
      title: `${produto.titulo} - ${formatarMoeda(produto.precoShopee)}`,
      description: produto.descricao.slice(0, 160),
      images: imagemUrl ? [{ url: imagemUrl }] : [],
    },
  };
}

export default async function ProdutoDetalhesPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const sParams = await searchParams;
  const paramOrigem = typeof sParams.origem === "string" ? sParams.origem : "site";
  const origem = ["site", "whatsapp", "bio"].includes(paramOrigem)
    ? paramOrigem
    : "site";

  const produto = await prisma.produto.findUnique({
    where: { id },
  });

  // Se não existir ou estiver oculto/ignorado/para revisar, retorna 404
  if (
    !produto ||
    produto.status === "OCULTO" ||
    produto.status === "IGNORADO" ||
    produto.status === "PARA_REVISAR"
  ) {
    notFound();
  }

  const isOfertaAcabou = produto.status === "OFERTA_ACABOU";

  let imagens: string[] = [];
  try {
    imagens = JSON.parse(produto.imagens || "[]");
  } catch {
    imagens = [];
  }

  let destaques: string[] = [];
  try {
    destaques = JSON.parse(produto.destaques || "[]");
  } catch {
    destaques = [];
  }

  // Busca "Veja também": até 4 produtos visíveis da mesma categoria
  const vejaTambem = await prisma.produto.findMany({
    where: {
      categoria: produto.categoria,
      id: { not: produto.id },
      status: { in: ["NO_AR", "PRECO_MUDOU"] },
    },
    take: 4,
  });

  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  const urlProdutoCompleta = `${siteUrl}/produtos/${produto.id}?origem=whatsapp`;
  const textoWhatsApp = encodeURIComponent(
    `Olha que achado: ${produto.titulo} por ${formatarMoeda(produto.precoShopee)} 👇\n${urlProdutoCompleta}`
  );

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
      {/* Botão Voltar */}
      <div className="mb-6">
        <Link
          href="/produtos"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o catálogo</span>
        </Link>
      </div>

      {/* Grid Principal do Produto */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-border">
        {/* Galeria de Fotos */}
        <div className="md:col-span-6 lg:col-span-6">
          <ProductGallery imagens={imagens} titulo={produto.titulo} />
        </div>

        {/* Informações do Produto */}
        <div className="md:col-span-6 lg:col-span-6 flex flex-col gap-5">
          {/* Categoria Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="info">
              {CATEGORIAS_NOMES[produto.categoria as CategoriaSlug] || produto.categoria}
            </Badge>
            {produto.status === "PRECO_MUDOU" && (
              <Badge variant="warning">Preço mudou</Badge>
            )}
          </div>

          {/* Título H1 */}
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text leading-tight">
            {produto.titulo}
          </h1>

          {/* Preço e Legenda */}
          <div className="p-4 rounded-2xl bg-surface-alt/70 border border-border/70 flex flex-col gap-1.5">
            <Price
              value={produto.precoShopee}
              originalValue={produto.precoAnterior}
              size="xl"
            />
            <p className="text-xs text-text-muted">
              Preço consultado em {formatarData(produto.precoConsultadoEm)}, pode
              variar na Shopee.
            </p>
          </div>

          {/* Estado OFERTA ACABOU ou BOTÕES DE AÇÃO */}
          {isOfertaAcabou ? (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-danger flex items-center gap-3">
              <AlertOctagon className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold text-sm">Esta oferta acabou na Shopee.</p>
                <p className="text-xs text-red-700 mt-0.5">
                  O produto está indisponível ou a promoção encerrou. Confira produtos
                  similares abaixo.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-2">
              <a
                href={`/ir/${produto.id}?origem=${encodeURIComponent(origem)}`}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="flex-1 min-h-[50px] px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-primary/20"
              >
                <span>Ver oferta na Shopee</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href={`https://wa.me/?text=${textoWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[50px] px-4 py-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-sm flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartilhar</span>
              </a>
            </div>
          )}

          {/* 3 Destaques */}
          {destaques.length > 0 && (
            <div className="pt-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                Por que vale a pena
              </h3>
              <ul className="flex flex-col gap-2.5">
                {destaques.map((item, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm text-text">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Descrição Completa */}
          <div className="pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
              Detalhes do achado
            </h3>
            <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line">
              {produto.descricao}
            </p>
          </div>

          {/* Selo de Garantia Shopee */}
          <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-text-muted">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Compra realizada diretamente no ambiente seguro da Shopee.</span>
          </div>
        </div>
      </div>

      {/* Seção "Veja também" */}
      {vejaTambem.length > 0 && (
        <section className="pt-12">
          <div className="mb-6">
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-text">
              {isOfertaAcabou
                ? "Achados recomendados para você"
                : "Veja também nesta categoria"}
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              Outras opções selecionadas com o mesmo carinho e praticidade
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {vejaTambem.map((item) => {
              const imgs = JSON.parse(item.imagens || "[]");
              return (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  titulo={item.titulo}
                  precoShopee={item.precoShopee}
                  precoAnterior={item.precoAnterior}
                  imagem={imgs[0]}
                  categoria={item.categoria}
                  status={item.status}
                  origem={origem}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Sticky Mobile Bar (aparece ao rolar a página no mobile) */}
      {!isOfertaAcabou && (
        <StickyMobileBar
          produtoId={produto.id}
          preco={produto.precoShopee}
          origem={origem}
        />
      )}
    </div>
  );
}

