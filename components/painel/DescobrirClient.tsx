"use client";

import React, { useState } from "react";
import Image from "next/image";
import { formatarMoeda, formatarPercentual } from "@/lib/format";
import { calcularGanhoEstimado } from "@/lib/calc";
import { adicionarPorCatalogoAction } from "@/lib/actions/produtos";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { CATEGORIAS_NOMES, CategoriaSlug } from "@/lib/validation";
import { OfertaShopee } from "@/lib/services/shopee";
import {
  Search,
  Plus,
  Check,
  Compass,
} from "lucide-react";

interface DescobrirClientProps {
  initialOffers: OfertaShopee[];
  idsNoBanco: string[];
  categoriasPermitidas: string[];
}

export function DescobrirClient({
  initialOffers,
  idsNoBanco,
  categoriasPermitidas,
}: DescobrirClientProps) {
  const { success, error } = useToast();
  const [termo, setTermo] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);
  const [cadastrados, setCadastrados] = useState<Set<string>>(new Set(idsNoBanco));
  const [adicionandoId, setAdicionandoId] = useState<string | null>(null);

  // Normalização para filtro simples local
  const normalizar = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  let ofertasFiltradas = initialOffers.filter((o) =>
    categoriasPermitidas.includes(o.categoria)
  );

  if (categoriaAtiva) {
    ofertasFiltradas = ofertasFiltradas.filter(
      (o) => o.categoria === categoriaAtiva
    );
  }

  if (termo.trim()) {
    const t = normalizar(termo.trim());
    ofertasFiltradas = ofertasFiltradas.filter(
      (o) => normalizar(o.nome).includes(t) || normalizar(o.descricaoOriginal).includes(t)
    );
  }

  const handleAdicionar = async (shopeeItemId: string) => {
    setAdicionandoId(shopeeItemId);
    const res = await adicionarPorCatalogoAction(shopeeItemId);
    setAdicionandoId(null);

    if (res.success) {
      setCadastrados((prev) => new Set([...prev, shopeeItemId]));
      success("Achado adicionado à sua lista com textos gerados por IA!");
    } else {
      error(res.error || "Não foi possível adicionar este produto.");
    }
  };

  const sugestoes = [
    "potes herméticos",
    "luminária",
    "organizador",
    "tapete",
    "difusor",
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text">
          Descobrir novos achados
        </h1>
        <p className="text-sm text-text-muted mt-1 leading-relaxed">
          Explore ofertas do catálogo da Shopee e adicione à sua vitrine com curadoria assistida por IA.
        </p>
      </div>

      {/* Barra de Busca + Sugestões */}
      <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-xs flex flex-col gap-3">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Ex.: organizador de cozinha, luminária..."
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            className="w-full min-h-[46px] pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Sugestões de Termos Clicáveis */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-text-muted">
            Sugestões rápidas:
          </span>
          {sugestoes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTermo(s)}
              className="text-xs px-2.5 py-1 rounded-full bg-surface-alt hover:bg-primary-soft hover:text-primary transition-colors text-text-muted font-medium"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Chips de Categorias Permitidas */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
          <span className="text-xs font-semibold text-text-muted">
            Categorias:
          </span>
          <button
            type="button"
            onClick={() => setCategoriaAtiva(null)}
            className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              categoriaAtiva === null
                ? "bg-primary text-white"
                : "bg-surface border border-border text-text hover:bg-surface-alt"
            }`}
          >
            Todas ({initialOffers.length})
          </button>
          {categoriasPermitidas.map((slug) => {
            const isSelected = categoriaAtiva === slug;
            const count = initialOffers.filter((o) => o.categoria === slug).length;
            return (
              <button
                key={slug}
                type="button"
                onClick={() => setCategoriaAtiva(isSelected ? null : slug)}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                  isSelected
                    ? "bg-primary text-white"
                    : "bg-surface border border-border text-text hover:bg-surface-alt"
                }`}
              >
                {CATEGORIAS_NOMES[slug as CategoriaSlug] || slug} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Resultados */}
      {ofertasFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {ofertasFiltradas.map((item) => {
            const isJaCadastrado = cadastrados.has(item.shopeeItemId);
            const isCarregando = adicionandoId === item.shopeeItemId;
            const ganho = calcularGanhoEstimado(item.preco, item.comissaoPercentual);
            const img = item.imagens[0] || "/produtos/potes-hermeticos.svg";

            return (
              <div
                key={item.shopeeItemId}
                className="bg-surface rounded-2xl border border-border p-4 shadow-xs flex flex-col justify-between gap-3 hover:border-primary/40 transition-all"
              >
                <div className="flex gap-3">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-surface-alt border border-border/60 shrink-0">
                    <Image
                      src={img}
                      alt={item.nome}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                      {CATEGORIAS_NOMES[item.categoria as CategoriaSlug] || item.categoria}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-text line-clamp-2 leading-snug mt-0.5">
                      {item.nome}
                    </h3>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-alt/80 flex flex-col gap-0.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Preço:</span>
                    <strong className="text-text font-bold">
                      {formatarMoeda(item.preco)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Comissão:</span>
                    <strong className="text-text font-bold">
                      {formatarPercentual(item.comissaoPercentual)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-primary font-bold pt-1 border-t border-border/50">
                    <span>Você ganha:</span>
                    <span>cerca de {formatarMoeda(ganho)} por venda</span>
                  </div>
                </div>

                {/* Botão de Ação */}
                <div className="pt-1">
                  {isJaCadastrado ? (
                    <div className="min-h-[44px] px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Já está na sua lista</span>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full"
                      loading={isCarregando}
                      onClick={() => handleAdicionar(item.shopeeItemId)}
                      icon={<Plus className="w-4 h-4" />}
                    >
                      Adicionar achado
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Compass className="w-8 h-8 text-text-muted" />}
          title="Nada encontrado para essa busca"
          description="Tente outras palavras ou escolha outra categoria nas opções acima."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setTermo("");
                setCategoriaAtiva(null);
              }}
            >
              Limpar busca
            </Button>
          }
        />
      )}
    </div>
  );
}

