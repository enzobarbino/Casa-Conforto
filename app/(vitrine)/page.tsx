import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { CategoryGrid } from "@/components/vitrine/CategoryGrid";
import { ProductCard } from "@/components/vitrine/ProductCard";
import {
  Sparkles,
  ArrowRight,
  Search,
  Eye,
  ShoppingBag,
  Flame,
  Clock,
} from "lucide-react";

function calcularTrintaDiasAtras(): Date {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
}

export default async function HomePage() {
  const trintaDiasAtras = calcularTrintaDiasAtras();

  // Busca produtos visíveis (NO_AR ou PRECO_MUDOU) com seus cliques dos últimos 30 dias
  const produtosVisiveis = await prisma.produto.findMany({
    where: {
      status: { in: ["NO_AR", "PRECO_MUDOU"] },
    },
    include: {
      cliques: {
        where: {
          criadoEm: { gte: trintaDiasAtras },
        },
        select: { id: true },
      },
    },
  });

  // Mais clicados nos últimos 30 dias (top 8)
  const maisClicados = [...produtosVisiveis]
    .sort((a, b) => b.cliques.length - a.cliques.length)
    .slice(0, 8);

  // Novidades: publicados mais recentemente (top 8)
  const novidades = [...produtosVisiveis]
    .sort((a, b) => {
      const dataA = a.publicadoEm ? new Date(a.publicadoEm).getTime() : 0;
      const dataB = b.publicadoEm ? new Date(b.publicadoEm).getTime() : 0;
      return dataB - dataA;
    })
    .slice(0, 8);

  return (
    <div className="flex flex-col gap-12 sm:gap-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-8 pt-6 sm:pt-10 w-full">
        <div className="rounded-3xl bg-gradient-to-br from-surface via-primary-soft/30 to-surface border border-border/80 p-6 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center overflow-hidden">
          {/* Texto Hero */}
          <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-xs w-fit">
              <Sparkles className="w-4 h-4" />
              <span>Achados selecionados com carinho</span>
            </div>

            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl lg:text-5xl text-text tracking-tight leading-[1.15]">
              Transforme sua casa em um refúgio de{" "}
              <span className="text-primary underline decoration-primary/30 decoration-wavy">
                praticidade
              </span>{" "}
              e bem-estar
            </h1>

            <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-xl">
              Achados selecionados da Shopee para deixar o dia a dia mais fácil,
              bonito e funcional — sem perder tempo procurando.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/produtos"
                className="min-h-[50px] px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-primary/20"
              >
                <span>Ver todos os achados</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/sobre"
                className="min-h-[50px] px-5 py-3 rounded-xl border border-border bg-surface text-text hover:bg-surface-alt font-medium text-sm sm:text-base flex items-center justify-center transition-colors"
              >
                Como funciona
              </Link>
            </div>
          </div>

          {/* Imagem / Banner Hero */}
          <div className="lg:col-span-5 relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-border/60 shadow-md">
            <Image
              src="/produtos/difusor-chama.svg"
              alt="Destaque Casa & Conforto"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-4">
              <span className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md">
                Achados para aconchego &amp; harmonia
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIAS */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-8 w-full">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-text">
              Navegue por categorias
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              Encontre o que você precisa para cada cantinho do seu lar
            </p>
          </div>
          <Link
            href="/produtos"
            className="text-xs sm:text-sm font-semibold text-primary hover:text-primary-dark flex items-center gap-1"
          >
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <CategoryGrid />
      </section>

      {/* 3. MAIS CLICADOS */}
      {maisClicados.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-4 sm:px-8 w-full">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <Flame className="w-5 h-5 fill-orange-500" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-xl sm:text-2xl text-text">
                  Os mais clicados
                </h2>
                <p className="text-xs sm:text-sm text-text-muted">
                  Os queridinhos que estão fazendo sucesso entre nossos visitantes
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {maisClicados.map((prod) => {
              const imagens = JSON.parse(prod.imagens || "[]");
              return (
                <ProductCard
                  key={prod.id}
                  id={prod.id}
                  titulo={prod.titulo}
                  precoShopee={prod.precoShopee}
                  precoAnterior={prod.precoAnterior}
                  imagem={imagens[0]}
                  categoria={prod.categoria}
                  status={prod.status}
                  origem="site"
                />
              );
            })}
          </div>
        </section>
      )}

      {/* 4. NOVIDADES */}
      {novidades.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-4 sm:px-8 w-full">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-primary flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-xl sm:text-2xl text-text">
                  Novidades no ar
                </h2>
                <p className="text-xs sm:text-sm text-text-muted">
                  Achados recém-chegados na nossa curadoria
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {novidades.map((prod) => {
              const imagens = JSON.parse(prod.imagens || "[]");
              return (
                <ProductCard
                  key={prod.id}
                  id={prod.id}
                  titulo={prod.titulo}
                  precoShopee={prod.precoShopee}
                  precoAnterior={prod.precoAnterior}
                  imagem={imagens[0]}
                  categoria={prod.categoria}
                  status={prod.status}
                  origem="site"
                />
              );
            })}
          </div>
        </section>
      )}

      {/* 5. COMO FUNCIONA */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-8 w-full">
        <div className="rounded-3xl bg-surface-alt/80 border border-border/80 p-8 sm:p-12">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              Passo a Passo
            </span>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-text mt-1">
              Como funciona o Casa &amp; Conforto
            </h2>
            <p className="text-sm text-text-muted mt-2">
              Você não paga nada a mais por comprar através das nossas indicações.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Passo 1 */}
            <div className="bg-surface rounded-2xl p-6 border border-border/60 shadow-xs flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary font-bold text-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-base text-text mb-2">
                1. Escolhemos os achados
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Garimpamos diariamente na Shopee os produtos mais bem avaliados, úteis
                e que realmente trazem praticidade para a sua casa.
              </p>
            </div>

            {/* Passo 2 */}
            <div className="bg-surface rounded-2xl p-6 border border-border/60 shadow-xs flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary font-bold text-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-base text-text mb-2">
                2. Você vê os detalhes aqui
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Apresentamos os principais destaques, preço transparente e informações
                claras sem enrolação nem termos técnicos.
              </p>
            </div>

            {/* Passo 3 */}
            <div className="bg-surface rounded-2xl p-6 border border-border/60 shadow-xs flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary font-bold text-lg flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-base text-text mb-2">
                3. Compra com segurança na Shopee
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Ao clicar em &quot;Ver oferta&quot;, você vai direto para o site ou app oficial da
                Shopee para concluir sua compra com segurança total.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
