"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatarNumero } from "@/lib/format";
import {
  ocultarProdutoAction,
  mostrarProdutoAction,
  confirmarPrecoAction,
} from "@/lib/actions/produtos";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import {
  Search,
  ExternalLink,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  Package,
  ChevronDown,
} from "lucide-react";

export interface ItemMeuProduto {
  id: string;
  titulo: string;
  precoShopee: number;
  precoAnterior?: number | null;
  categoria: string;
  imagens: string[];
  status: string;
  cliquesTotal: number;
  cliquesSemana: number;
  publicadoEm: string | null;
}

interface MeusProdutosClientProps {
  initialProducts: ItemMeuProduto[];
  counts: {
    todos: number;
    noAr: number;
    precoMudou: number;
    ofertaAcabou: number;
    ocultos: number;
  };
}

export function MeusProdutosClient({
  initialProducts,
  counts,
}: MeusProdutosClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error } = useToast();
  const [, startTransition] = useTransition();

  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<"cliques" | "recentes" | "menor-preco">(
    "cliques"
  );

  const statusParam = searchParams.get("status") || "TODOS";

  const handleTabChange = (novoStatus: string) => {
    if (novoStatus === "TODOS") {
      router.push("/painel/produtos");
    } else {
      router.push(`/painel/produtos?status=${novoStatus}`);
    }
  };

  // Copiar link com ?origem=whatsapp
  const handleCopiarLink = (id: string) => {
    const origin = window.location.origin;
    const url = `${origin}/produtos/${id}?origem=whatsapp`;
    navigator.clipboard.writeText(url);
    success("Link copiado para a área de transferência!");
  };

  // Alternar ocultar/mostrar
  const handleToggleOcultar = (id: string, currentStatus: string) => {
    startTransition(async () => {
      if (currentStatus === "OCULTO") {
        const res = await mostrarProdutoAction(id);
        if (res.success) {
          success("Produto mostrado na vitrine!");
          router.refresh();
        } else {
          error(res.error || "Erro ao mostrar produto.");
        }
      } else {
        const res = await ocultarProdutoAction(id);
        if (res.success) {
          success("Produto ocultado da vitrine.");
          router.refresh();
        } else {
          error(res.error || "Erro ao ocultar produto.");
        }
      }
    });
  };

  // Confirmar preço
  const handleConfirmarPreco = (id: string) => {
    startTransition(async () => {
      const res = await confirmarPrecoAction(id);
      if (res.success) {
        success("Novo preço confirmado!");
        router.refresh();
      } else {
        error(res.error || "Erro ao confirmar preço.");
      }
    });
  };

  // Filtragem e ordenação local
  const normalizar = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  let lista = [...initialProducts];

  // Filtro por Aba de Status
  if (statusParam === "NO_AR") {
    lista = lista.filter((p) => p.status === "NO_AR");
  } else if (statusParam === "PRECO_MUDOU") {
    lista = lista.filter((p) => p.status === "PRECO_MUDOU");
  } else if (statusParam === "OFERTA_ACABOU") {
    lista = lista.filter((p) => p.status === "OFERTA_ACABOU");
  } else if (statusParam === "OCULTO") {
    lista = lista.filter((p) => p.status === "OCULTO");
  }

  // Busca por título
  if (busca.trim()) {
    const b = normalizar(busca.trim());
    lista = lista.filter((p) => normalizar(p.titulo).includes(b));
  }

  // Ordenação
  if (ordem === "cliques") {
    lista.sort((a, b) => b.cliquesTotal - a.cliquesTotal);
  } else if (ordem === "menor-preco") {
    lista.sort((a, b) => a.precoShopee - b.precoShopee);
  } else if (ordem === "recentes") {
    lista.sort((a, b) => {
      const dataA = a.publicadoEm ? new Date(a.publicadoEm).getTime() : 0;
      const dataB = b.publicadoEm ? new Date(b.publicadoEm).getTime() : 0;
      return dataB - dataA;
    });
  }

  const abas = [
    { id: "TODOS", label: "Todos", count: counts.todos },
    { id: "NO_AR", label: "No ar", count: counts.noAr },
    { id: "PRECO_MUDOU", label: "Preço mudou", count: counts.precoMudou },
    { id: "OFERTA_ACABOU", label: "Oferta acabou", count: counts.ofertaAcabou },
    { id: "OCULTO", label: "Ocultos", count: counts.ocultos },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Topo */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text">
          Meus produtos
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Gerencie os achados da sua vitrine, copie links de divulgação e acompanhe cliques.
        </p>
      </div>

      {/* Abas com Contadores */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-border">
        {abas.map((aba) => {
          const isActive = statusParam === aba.id;
          return (
            <button
              key={aba.id}
              onClick={() => handleTabChange(aba.id)}
              className={`min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-text"
              }`}
            >
              <span>{aba.label}</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  isActive
                    ? "bg-primary-soft text-primary font-bold"
                    : "bg-surface-alt text-text-muted"
                }`}
              >
                {aba.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Controles de Busca e Ordenação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por título do produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted font-medium whitespace-nowrap">
            Ordenar por:
          </span>
          <div className="relative">
            <select
              value={ordem}
              onChange={(e) =>
                setOrdem(
                  e.target.value as "cliques" | "recentes" | "menor-preco"
                )
              }
              className="appearance-none min-h-[44px] pl-3 pr-8 py-2 rounded-xl border border-border bg-surface text-text text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="cliques">Mais clicados</option>
              <option value="recentes">Mais recentes</option>
              <option value="menor-preco">Menor preço</option>
            </select>
            <ChevronDown className="w-4 h-4 text-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* LISTA: TABELA NO DESKTOP / CARDS NO MOBILE */}
      {lista.length > 0 ? (
        <>
          {/* 1. VISÃO DESKTOP (TABELA) */}
          <div className="hidden md:block bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-alt/70 text-xs font-bold text-text-muted uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="px-5 py-3.5">Produto</th>
                  <th className="px-4 py-3.5">Preço</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-center">Cliques (7d / Total)</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lista.map((prod) => {
                  const img = prod.imagens[0] || "/produtos/potes-hermeticos.svg";

                  return (
                    <tr key={prod.id} className="hover:bg-surface-alt/40 transition-colors">
                      {/* Miniatura + Título */}
                      <td className="px-5 py-3.5 max-w-sm">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface-alt border border-border/60 shrink-0">
                            <Image
                              src={img}
                              alt={prod.titulo}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <Link
                            href={`/painel/produtos/${prod.id}`}
                            className="font-semibold text-text hover:text-primary transition-colors line-clamp-2"
                          >
                            {prod.titulo}
                          </Link>
                        </div>
                      </td>

                      {/* Preço */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <Price
                          value={prod.precoShopee}
                          originalValue={prod.precoAnterior}
                          size="sm"
                        />
                        {prod.status === "PRECO_MUDOU" && (
                          <div className="pt-1">
                            <button
                              onClick={() => handleConfirmarPreco(prod.id)}
                              className="text-[11px] font-bold text-warning hover:underline"
                            >
                              Confirmar novo preço
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={prod.status} />
                      </td>

                      {/* Cliques */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <span className="font-bold text-text">
                          {formatarNumero(prod.cliquesSemana)}
                        </span>
                        <span className="text-text-muted text-xs">
                          {" "}/ {formatarNumero(prod.cliquesTotal)}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copiar Link */}
                          <button
                            onClick={() => handleCopiarLink(prod.id)}
                            className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-surface-alt transition-colors"
                            title="Copiar link com ?origem=whatsapp"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Ver na vitrine */}
                          <a
                            href={`/produtos/${prod.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-surface-alt transition-colors"
                            title="Ver na vitrine"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          {/* Ocultar / Mostrar */}
                          <button
                            onClick={() => handleToggleOcultar(prod.id, prod.status)}
                            className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-colors"
                            title={prod.status === "OCULTO" ? "Mostrar" : "Ocultar"}
                          >
                            {prod.status === "OCULTO" ? (
                              <Eye className="w-4 h-4 text-primary" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </button>

                          {/* Editar */}
                          <Link
                            href={`/painel/produtos/${prod.id}`}
                            className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-surface-alt transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 2. VISÃO MOBILE (CARDS EMPILHADOS) */}
          <div className="md:hidden flex flex-col gap-3">
            {lista.map((prod) => {
              const img = prod.imagens[0] || "/produtos/potes-hermeticos.svg";

              return (
                <div
                  key={prod.id}
                  className="bg-surface rounded-2xl border border-border p-4 shadow-xs flex flex-col gap-3"
                >
                  <div className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-alt border border-border/60 shrink-0">
                      <Image
                        src={img}
                        alt={prod.titulo}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <StatusBadge status={prod.status} />
                        <span className="text-xs text-text-muted font-medium">
                          {prod.cliquesSemana} cliques (7d)
                        </span>
                      </div>
                      <Link
                        href={`/painel/produtos/${prod.id}`}
                        className="font-bold text-xs sm:text-sm text-text line-clamp-2 hover:text-primary"
                      >
                        {prod.titulo}
                      </Link>
                      <div className="mt-1">
                        <Price
                          value={prod.precoShopee}
                          originalValue={prod.precoAnterior}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>

                  {prod.status === "PRECO_MUDOU" && (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleConfirmarPreco(prod.id)}
                      className="w-full text-xs"
                    >
                      Confirmar novo preço
                    </Button>
                  )}

                  {/* Ações Mobile */}
                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <button
                      onClick={() => handleCopiarLink(prod.id)}
                      className="text-xs font-semibold text-primary flex items-center gap-1.5 p-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar link</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleOcultar(prod.id, prod.status)}
                        className="text-xs text-text-muted hover:text-text p-1.5"
                      >
                        {prod.status === "OCULTO" ? "Mostrar" : "Ocultar"}
                      </button>

                      <Link
                        href={`/painel/produtos/${prod.id}`}
                        className="text-xs font-semibold text-text hover:text-primary p-1.5"
                      >
                        Editar
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <EmptyState
          icon={<Package className="w-8 h-8 text-text-muted" />}
          title={
            statusParam === "OFERTA_ACABOU"
              ? "Nenhuma oferta acabou. Ótimo!"
              : statusParam === "PRECO_MUDOU"
              ? "Nenhum produto mudou de preço recentemente."
              : statusParam === "OCULTO"
              ? "Nenhum produto está oculto."
              : "Nenhum produto encontrado."
          }
          description="Você pode navegar pelas outras abas ou adicionar novos achados da Shopee."
          action={
            <Link href="/painel/descobrir">
              <Button variant="primary">Descobrir novos achados</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}

