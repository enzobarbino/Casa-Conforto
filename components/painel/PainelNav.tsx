"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import {
  Home,
  CheckSquare,
  PlusCircle,
  Package,
  Compass,
  Settings,
  LogOut,
  Sparkles,
  ExternalLink,
  MoreHorizontal,
  X,
} from "lucide-react";

interface PainelNavProps {
  revisarCount: number;
}

export function PainelNav({ revisarCount }: PainelNavProps) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const navItems = [
    { label: "Início", href: "/painel", icon: Home, exact: true },
    {
      label: "Revisar",
      href: "/painel/revisar",
      icon: CheckSquare,
      badge: revisarCount > 0 ? revisarCount : undefined,
    },
    { label: "Adicionar", href: "/painel/adicionar", icon: PlusCircle },
    { label: "Descobrir", href: "/painel/descobrir", icon: Compass },
    { label: "Meus produtos", href: "/painel/produtos", icon: Package },
    { label: "Configurações", href: "/painel/configuracoes", icon: Settings },
  ];

  const isActive = (href: string, exact: boolean = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <>
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface border-r border-border shrink-0 min-h-screen p-5 sticky top-0 h-screen overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 pb-6 border-b border-border/80 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-base text-text leading-tight">
              Casa &amp; Conforto
            </span>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
              Painel de Controle
            </span>
          </div>
        </div>

        {/* Links Principais */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`min-h-[44px] px-3.5 py-2.5 rounded-xl font-medium text-sm flex items-center justify-between transition-colors ${
                  active
                    ? "bg-primary-soft text-primary font-semibold shadow-xs"
                    : "text-text-muted hover:text-text hover:bg-surface-alt"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-text-muted"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="pt-4 border-t border-border flex flex-col gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-primary hover:bg-surface-alt flex items-center gap-2.5 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Ver vitrine pública</span>
          </a>

          <button
            onClick={handleLogout}
            className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold text-danger hover:bg-red-50 flex items-center gap-2.5 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do painel</span>
          </button>
        </div>
      </aside>

      {/* 2. MOBILE BOTTOM NAVIGATION (5 ITENS OBRIGATÓRIOS) */}
      <nav
        aria-label="Navegação inferior do painel"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      >
        <div className="grid grid-cols-5 items-center max-w-lg mx-auto">
          {/* 1. Início */}
          <Link
            href="/painel"
            className={`min-h-[48px] flex flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold transition-colors ${
              pathname === "/painel" ? "text-primary" : "text-text-muted hover:text-text"
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Início</span>
          </Link>

          {/* 2. Revisar (com contador) */}
          <Link
            href="/painel/revisar"
            className={`min-h-[48px] relative flex flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold transition-colors ${
              pathname.startsWith("/painel/revisar")
                ? "text-primary"
                : "text-text-muted hover:text-text"
            }`}
          >
            <div className="relative">
              <CheckSquare className="w-5 h-5" />
              {revisarCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                  {revisarCount}
                </span>
              )}
            </div>
            <span>Revisar</span>
          </Link>

          {/* 3. Adicionar */}
          <Link
            href="/painel/adicionar"
            className={`min-h-[48px] flex flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold transition-colors ${
              pathname.startsWith("/painel/adicionar")
                ? "text-primary"
                : "text-text-muted hover:text-text"
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            <span>Adicionar</span>
          </Link>

          {/* 4. Meus produtos */}
          <Link
            href="/painel/produtos"
            className={`min-h-[48px] flex flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold transition-colors ${
              pathname.startsWith("/painel/produtos")
                ? "text-primary"
                : "text-text-muted hover:text-text"
            }`}
          >
            <Package className="w-5 h-5" />
            <span>Produtos</span>
          </Link>

          {/* 5. Mais */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold transition-colors ${
              isMoreOpen ? "text-primary" : "text-text-muted hover:text-text"
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span>Mais</span>
          </button>
        </div>
      </nav>

      {/* GAVETA / MODAL "MAIS" NO MOBILE */}
      {isMoreOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md bg-surface rounded-t-3xl p-6 shadow-2xl border-t border-border animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <span className="font-heading font-bold text-base text-text">
                Mais opções
              </span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:bg-surface-alt"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href="/painel/descobrir"
                onClick={() => setIsMoreOpen(false)}
                className="min-h-[48px] px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold text-text hover:bg-surface-alt"
              >
                <Compass className="w-5 h-5 text-primary" />
                <span>Descobrir novos achados</span>
              </Link>

              <Link
                href="/painel/configuracoes"
                onClick={() => setIsMoreOpen(false)}
                className="min-h-[48px] px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold text-text hover:bg-surface-alt"
              >
                <Settings className="w-5 h-5 text-text-muted" />
                <span>Configurações</span>
              </Link>

              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMoreOpen(false)}
                className="min-h-[48px] px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold text-text hover:bg-surface-alt"
              >
                <ExternalLink className="w-5 h-5 text-text-muted" />
                <span>Ver vitrine pública</span>
              </a>

              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  handleLogout();
                }}
                className="min-h-[48px] px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold text-danger hover:bg-red-50 text-left"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair da conta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

