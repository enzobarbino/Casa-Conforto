import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { formatarMoeda, formatarNumero } from "@/lib/format";
import {
  calcularMetricasCliques,
  somarComissoes,
  contarProdutosNoAr,
} from "@/lib/calc";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  MousePointerClick,
  Clock,
  CheckCircle2,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  PlusCircle,
  AlertCircle,
} from "lucide-react";

export default async function PainelInicioPage() {
  const now = new Date();
  const seteDiasAtras = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const quatorzeDiasAtras = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // 1. Cliques da semana atual vs semana anterior
  const cliquesUltimos7Dias = await prisma.clique.count({
    where: { criadoEm: { gte: seteDiasAtras } },
  });

  const cliques7DiasAnteriores = await prisma.clique.count({
    where: {
      criadoEm: {
        gte: quatorzeDiasAtras,
        lt: seteDiasAtras,
      },
    },
  });

  const metricasCliques = calcularMetricasCliques(
    cliquesUltimos7Dias,
    cliques7DiasAnteriores
  );

  // 2. Comissões
  const comissoes = await prisma.comissao.findMany({
    select: { valor: true, status: true },
  });
  const comissaoPendente = somarComissoes(comissoes, "PENDENTE");
  const comissaoConfirmada = somarComissoes(comissoes, "CONFIRMADA");

  // 3. Contagem por status
  const todosProdutos = await prisma.produto.findMany({
    select: {
      id: true,
      titulo: true,
      precoShopee: true,
      imagens: true,
      status: true,
    },
  });

  const produtosNoArCount = contarProdutosNoAr(todosProdutos);
  const paraRevisarCount = todosProdutos.filter((p) => p.status === "PARA_REVISAR").length;
  const precoMudouCount = todosProdutos.filter((p) => p.status === "PRECO_MUDOU").length;
  const ofertaAcabouCount = todosProdutos.filter((p) => p.status === "OFERTA_ACABOU").length;

  // 4. Mais clicados da semana (top 5)
  const produtosComCliquesSemana = await prisma.produto.findMany({
    where: {
      status: { in: ["NO_AR", "PRECO_MUDOU"] },
    },
    include: {
      cliques: {
        where: { criadoEm: { gte: seteDiasAtras } },
        select: { id: true },
      },
    },
  });

  const topClicadosSemana = [...produtosComCliquesSemana]
    .map((p) => ({
      ...p,
      cliquesSemana: p.cliques.length,
    }))
    .sort((a, b) => b.cliquesSemana - a.cliquesSemana)
    .slice(0, 5);

  const temProdutos = todosProdutos.length > 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Saudação */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text">
          Olá! Veja como estão seus achados.
        </h1>
        <p className="text-sm text-text-muted">
          Resumo do desempenho da sua vitrine e tarefas de hoje.
        </p>
      </div>

      {!temProdutos ? (
        <EmptyState
          icon={<Sparkles className="w-8 h-8 text-primary" />}
          title="Você ainda não tem achados na vitrine"
          description="Comece colando um link da Shopee. A inteligência artificial vai estruturar o título, a descrição e os destaques para você."
          action={
            <Link href="/painel/adicionar">
              <Button variant="primary" icon={<PlusCircle className="w-4 h-4" />}>
                Adicionar produto
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          {/* Card "Para revisar" em destaque (oculto se n = 0) */}
          {paraRevisarCount > 0 && (
            <div className="p-5 sm:p-6 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-info text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base sm:text-lg text-text">
                    Você tem {paraRevisarCount} {paraRevisarCount === 1 ? "achado esperando" : "achados esperando"} revisão
                  </h3>
                  <p className="text-xs sm:text-sm text-text-muted">
                    Confira as sugestões da inteligência artificial e publique na vitrine com um clique.
                  </p>
                </div>
              </div>

              <Link href="/painel/revisar">
                <Button variant="primary" className="whitespace-nowrap">
                  Revisar agora
                </Button>
              </Link>
            </div>
          )}

          {/* Avisos Importantes (Preço mudou / Oferta acabou) */}
          {(precoMudouCount > 0 || ofertaAcabouCount > 0) && (
            <div className="flex flex-col gap-3">
              {precoMudouCount > 0 && (
                <Link
                  href="/painel/produtos?status=PRECO_MUDOU"
                  className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100/70 transition-colors flex items-center justify-between gap-3 text-xs sm:text-sm font-medium"
                >
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                    <span>
                      <strong>{precoMudouCount} {precoMudouCount === 1 ? "produto mudou" : "produtos mudaram"}</strong> de preço na Shopee.
                    </span>
                  </div>
                  <span className="text-warning font-semibold flex items-center gap-1 shrink-0">
                    Ver produtos <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              )}

              {ofertaAcabouCount > 0 && (
                <Link
                  href="/painel/produtos?status=OFERTA_ACABOU"
                  className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 hover:bg-red-100/70 transition-colors flex items-center justify-between gap-3 text-xs sm:text-sm font-medium"
                >
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-danger shrink-0" />
                    <span>
                      <strong>{ofertaAcabouCount} {ofertaAcabouCount === 1 ? "oferta acabou" : "ofertas acabaram"}</strong> e {ofertaAcabouCount === 1 ? "saiu" : "saíram"} da vitrine.
                    </span>
                  </div>
                  <span className="text-danger font-semibold flex items-center gap-1 shrink-0">
                    Ver produtos <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              )}
            </div>
          )}

          {/* 4 CARDS DE MÉTRICAS (Grade 2x2 no mobile, 4 colunas no desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Card 1: Cliques da semana */}
            <Card className="p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-text-muted mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Cliques da semana
                </span>
                <MousePointerClick className="w-4 h-4 text-primary" />
              </div>
              <div className="my-1">
                <span className="font-heading font-extrabold text-2xl sm:text-3xl text-text">
                  {formatarNumero(metricasCliques.cliquesAtuais)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold mt-1">
                {metricasCliques.variacaoPercentual >= 0 ? (
                  <span className="text-success inline-flex items-center gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{metricasCliques.variacaoPercentual}%
                  </span>
                ) : (
                  <span className="text-danger inline-flex items-center gap-0.5">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {metricasCliques.variacaoPercentual}%
                  </span>
                )}
                <span className="text-text-muted font-normal">vs. semana anterior</span>
              </div>
            </Card>

            {/* Card 2: Comissão pendente */}
            <Card className="p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-text-muted mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Comissão pendente
                </span>
                <Clock className="w-4 h-4 text-warning" />
              </div>
              <div className="my-1">
                <span className="font-heading font-extrabold text-2xl sm:text-3xl text-text">
                  {formatarMoeda(comissaoPendente)}
                </span>
              </div>
              <span className="text-xs text-text-muted">
                Aguardando confirmação da Shopee
              </span>
            </Card>

            {/* Card 3: Comissão confirmada */}
            <Card className="p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-text-muted mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Comissão confirmada
                </span>
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
              <div className="my-1">
                <span className="font-heading font-extrabold text-2xl sm:text-3xl text-success">
                  {formatarMoeda(comissaoConfirmada)}
                </span>
              </div>
              <span className="text-xs text-text-muted">Já confirmada</span>
            </Card>

            {/* Card 4: Produtos no ar */}
            <Card className="p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-text-muted mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Produtos no ar
                </span>
                <Package className="w-4 h-4 text-primary" />
              </div>
              <div className="my-1">
                <span className="font-heading font-extrabold text-2xl sm:text-3xl text-text">
                  {formatarNumero(produtosNoArCount)}
                </span>
              </div>
              <Link
                href="/painel/produtos"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Ver todos os produtos →
              </Link>
            </Card>
          </div>

          {/* Mais clicados da semana */}
          <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-text">
                  Mais clicados da semana
                </h3>
                <p className="text-xs text-text-muted">
                  Os produtos que mais atraíram o interesse dos visitantes nos últimos 7 dias.
                </p>
              </div>
              <Link
                href="/painel/produtos"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Ver catálogo completo
              </Link>
            </div>

            {topClicadosSemana.length > 0 ? (
              <div className="divide-y divide-border">
                {topClicadosSemana.map((prod, idx) => {
                  let imagens: string[] = [];
                  try {
                    imagens = JSON.parse(prod.imagens || "[]");
                  } catch {
                    imagens = [];
                  }
                  const img = imagens[0] || "/produtos/potes-hermeticos.svg";

                  return (
                    <div
                      key={prod.id}
                      className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-extrabold text-text-muted w-4 text-center">
                          #{idx + 1}
                        </span>
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface-alt border border-border/60 shrink-0">
                          <Image
                            src={img}
                            alt={prod.titulo}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <Link
                            href={`/painel/produtos/${prod.id}`}
                            className="text-sm font-semibold text-text hover:text-primary transition-colors line-clamp-1"
                          >
                            {prod.titulo}
                          </Link>
                          <span className="text-xs text-text-muted font-medium">
                            {formatarMoeda(prod.precoShopee)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold text-text">
                            {prod.cliquesSemana}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            cliques
                          </span>
                        </div>

                        <Link href={`/painel/produtos/${prod.id}`}>
                          <Button variant="secondary" size="md">
                            Editar
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-text-muted py-4 text-center">
                Ainda não houve cliques registrados nesta semana.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

