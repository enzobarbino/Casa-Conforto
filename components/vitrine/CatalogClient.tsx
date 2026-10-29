"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/vitrine/ProductCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
  PackageOpen,
} from "lucide-react";
import { CATEGORIAS_NOMES, CategoriaSlug } from "@/lib/validation";

export interface CatalogProduct {
  id: string;
  titulo: string;
  precoShopee: number;
  precoAnterior?: number | null;
  categoria: string;
  imagens: string[];
  status: string;
  cliquesCount: number;
  publicadoEm: string | null;
}

interface CatalogClientProps {
  initialProducts: CatalogProduct[];
  categoryCounts: Record<string, number>;
}

export function CatalogClient({
  initialProducts,
  categoryCounts,
}: CatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  // Read current params from URL
  const currentQuery = searchParams.get("q") || "";
  const currentCategory = searchParams.get("categoria") || "";
  const currentPreco = searchParams.get("preco") || "";
  const currentOrdem = searchParams.get("ordem") || "mais-clicados";

  // Categories list
  const categorias: { slug: CategoriaSlug; nome: string }[] = [
    { slug: "cozinha-mesa", nome: CATEGORIAS_NOMES["cozinha-mesa"] },
    { slug: "conforto-banho", nome: CATEGORIAS_NOMES["conforto-banho"] },
    { slug: "decoracao-aromas", nome: CATEGORIAS_NOMES["decoracao-aromas"] },
    { slug: "utilidades", nome: CATEGORIAS_NOMES["utilidades"] },
    { slug: "organizacao", nome: CATEGORIAS_NOMES["organizacao"] },
  ];

  // Helper to update URL params
  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(newParams)) {
      if (val === null || val === "") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    }
    startTransition(() => {
      router.push(`/produtos?${params.toString()}`, { scroll: false });
    });
    setVisibleCount(12); // reset pagination when filter changes
  };

  const handleCategoryToggle = (slug: string) => {
    if (currentCategory === slug) {
      updateParams({ categoria: null });
    } else {
      updateParams({ categoria: slug });
    }
  };

  const handlePrecoToggle = (faixa: string) => {
    if (currentPreco === faixa) {
      updateParams({ preco: null });
    } else {
      updateParams({ preco: faixa });
    }
  };

  const handleClearAll = () => {
    router.push("/produtos");
    setVisibleCount(12);
  };

  // Normalization for search filtering
  const normalizar = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // Client-side filtering & sorting
  let filtered = [...initialProducts];

  // 1. Text search
  if (currentQuery.trim()) {
    const qNorm = normalizar(currentQuery.trim());
    filtered = filtered.filter((p) => normalizar(p.titulo).includes(qNorm));
  }

  // 2. Category filter
  if (currentCategory) {
    filtered = filtered.filter((p) => p.categoria === currentCategory);
  }

  // 3. Price range filter
  if (currentPreco === "ate-50") {
    filtered = filtered.filter((p) => p.precoShopee <= 50);
  } else if (currentPreco === "50-100") {
    filtered = filtered.filter((p) => p.precoShopee > 50 && p.precoShopee <= 100);
  } else if (currentPreco === "100-200") {
    filtered = filtered.filter((p) => p.precoShopee > 100 && p.precoShopee <= 200);
  } else if (currentPreco === "acima-200") {
    filtered = filtered.filter((p) => p.precoShopee > 200);
  }

  // 4. Sorting
  if (currentOrdem === "mais-clicados") {
    filtered.sort((a, b) => b.cliquesCount - a.cliquesCount);
  } else if (currentOrdem === "menor-preco") {
    filtered.sort((a, b) => a.precoShopee - b.precoShopee);
  } else if (currentOrdem === "maior-preco") {
    filtered.sort((a, b) => b.precoShopee - a.precoShopee);
  } else if (currentOrdem === "recentes") {
    filtered.sort((a, b) => {
      const timeA = a.publicadoEm ? new Date(a.publicadoEm).getTime() : 0;
      const timeB = b.publicadoEm ? new Date(b.publicadoEm).getTime() : 0;
      return timeB - timeA;
    });
  }

  const displayedProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Active filters count for chips
  const hasActiveFilters = Boolean(
    currentQuery || currentCategory || currentPreco || currentOrdem !== "mais-clicados"
  );

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text">
            Achados para o seu lar
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Mostrando {displayedProducts.length} de {filtered.length} achados
          </p>
        </div>

        {/* Mobile Filter Button & Desktop Sort Select */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="md:hidden flex-1 justify-center"
            onClick={() => setIsDrawerOpen(true)}
            icon={<Filter className="w-4 h-4" />}
          >
            Filtrar {currentCategory || currentPreco ? "• Ativo" : ""}
          </Button>

          {/* Sort Dropdown */}
          <div className="relative flex items-center min-w-[180px]">
            <select
              value={currentOrdem}
              onChange={(e) => updateParams({ ordem: e.target.value })}
              className="w-full min-h-[44px] appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-border bg-surface text-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="mais-clicados">Mais clicados</option>
              <option value="recentes">Mais recentes</option>
              <option value="menor-preco">Menor preço</option>
              <option value="maior-preco">Maior preço</option>
            </select>
            <ChevronDown className="w-4 h-4 text-text-muted absolute right-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl bg-surface-alt/80 border border-border/60">
          <span className="text-xs font-semibold text-text-muted mr-1">
            Filtros ativos:
          </span>

          {currentQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-surface border border-border text-text">
              Busca: &ldquo;{currentQuery}&rdquo;
              <button
                onClick={() => updateParams({ q: null })}
                className="hover:text-danger ml-0.5"
                aria-label="Remover busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {currentCategory && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-surface border border-border text-text">
              {CATEGORIAS_NOMES[currentCategory as CategoriaSlug] || currentCategory}
              <button
                onClick={() => updateParams({ categoria: null })}
                className="hover:text-danger ml-0.5"
                aria-label="Remover categoria"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {currentPreco && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-surface border border-border text-text">
              {currentPreco === "ate-50"
                ? "Até R$ 50"
                : currentPreco === "50-100"
                ? "R$ 50 a R$ 100"
                : currentPreco === "100-200"
                ? "R$ 100 a R$ 200"
                : "Acima de R$ 200"}
              <button
                onClick={() => updateParams({ preco: null })}
                className="hover:text-danger ml-0.5"
                aria-label="Remover preço"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          <button
            onClick={handleClearAll}
            className="text-xs font-semibold text-primary hover:text-primary-dark hover:underline ml-auto"
          >
            Limpar tudo
          </button>
        </div>
      )}

      {/* Main Grid + Sidebar Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden md:block md:col-span-3 bg-surface rounded-2xl border border-border/80 p-5 shadow-xs sticky top-24">
          <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
            <div className="flex items-center gap-2 font-heading font-bold text-base text-text">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              <span>Filtros</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleClearAll}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Categorias */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
              Categorias
            </h3>
            <div className="flex flex-col gap-2">
              {categorias.map((cat) => {
                const isSelected = currentCategory === cat.slug;
                const count = categoryCounts[cat.slug] || 0;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategoryToggle(cat.slug)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left ${
                      isSelected
                        ? "bg-primary-soft text-primary font-semibold"
                        : "text-text hover:bg-surface-alt"
                    }`}
                  >
                    <span>{cat.nome}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-surface-alt text-text-muted"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Faixa de Preço */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
              Faixa de Preço
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: "ate-50", label: "Até R$ 50" },
                { id: "50-100", label: "R$ 50 a R$ 100" },
                { id: "100-200", label: "R$ 100 a R$ 200" },
                { id: "acima-200", label: "Acima de R$ 200" },
              ].map((faixa) => {
                const isSelected = currentPreco === faixa.id;
                return (
                  <button
                    key={faixa.id}
                    onClick={() => handlePrecoToggle(faixa.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                      isSelected
                        ? "bg-primary border-primary text-white"
                        : "border-border bg-surface text-text hover:bg-surface-alt"
                    }`}
                  >
                    {faixa.label}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* PRODUCTS GRID */}
        <section className="col-span-1 md:col-span-9">
          {displayedProducts.length > 0 ? (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {displayedProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    id={prod.id}
                    titulo={prod.titulo}
                    precoShopee={prod.precoShopee}
                    precoAnterior={prod.precoAnterior}
                    imagem={prod.imagens[0]}
                    categoria={prod.categoria}
                    status={prod.status}
                    origem="site"
                  />
                ))}
              </div>

              {/* Botão Carregar Mais */}
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                  >
                    Carregar mais achados ({filtered.length - visibleCount} restantes)
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={<PackageOpen className="w-7 h-7 text-text-muted" />}
              title="Nenhum achado com esses filtros"
              description="Tente escolher outra categoria, alterar o termo pesquisado ou remover os filtros de preço."
              action={
                <Button variant="primary" onClick={handleClearAll}>
                  Limpar filtros
                </Button>
              }
            />
          )}
        </section>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {isDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md bg-surface rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div className="flex items-center gap-2 font-heading font-bold text-lg text-text">
                <Filter className="w-5 h-5 text-primary" />
                <span>Filtrar Produtos</span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:bg-surface-alt"
                aria-label="Fechar filtros"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categorias Mobile */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                Categorias
              </h4>
              <div className="flex flex-col gap-2">
                {categorias.map((cat) => {
                  const isSelected = currentCategory === cat.slug;
                  const count = categoryCounts[cat.slug] || 0;
                  return (
                    <button
                      key={cat.slug}
                      onClick={() => handleCategoryToggle(cat.slug)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isSelected
                          ? "bg-primary-soft text-primary font-semibold"
                          : "text-text hover:bg-surface-alt"
                      }`}
                    >
                      <span>{cat.nome}</span>
                      <span className="text-xs text-text-muted">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Faixa de Preço Mobile */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                Faixa de Preço
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "ate-50", label: "Até R$ 50" },
                  { id: "50-100", label: "R$ 50 a R$ 100" },
                  { id: "100-200", label: "R$ 100 a R$ 200" },
                  { id: "acima-200", label: "Acima de R$ 200" },
                ].map((faixa) => {
                  const isSelected = currentPreco === faixa.id;
                  return (
                    <button
                      key={faixa.id}
                      onClick={() => handlePrecoToggle(faixa.id)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                        isSelected
                          ? "bg-primary border-primary text-white"
                          : "border-border bg-surface text-text hover:bg-surface-alt"
                      }`}
                    >
                      {faixa.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botão Aplicar e Fechar */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleClearAll}
              >
                Limpar
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => setIsDrawerOpen(false)}
              >
                Ver resultados ({filtered.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

