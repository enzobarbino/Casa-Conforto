"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Sparkles, X, Menu } from "lucide-react";

export function Header() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/produtos?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border transition-all">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-text hover:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold text-xl shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-lg sm:text-xl text-text tracking-tight leading-tight">
              Casa &amp; Conforto
            </span>
            <span className="text-[11px] font-medium text-text-muted hidden sm:inline leading-none">
              Achados Selecionados
            </span>
          </div>
        </Link>

        {/* Desktop Search Bar */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center flex-1 max-w-md mx-6 relative"
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar organizador, luminária, utilidades..."
            className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-full border border-border bg-surface-alt/70 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all placeholder:text-text-muted/70"
          />
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </form>

        {/* Navigation Links & Mobile Search Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden p-2.5 rounded-xl text-text hover:bg-surface-alt transition-colors"
            aria-label="Abrir busca"
          >
            {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>

          <nav className="hidden sm:flex items-center gap-1 sm:gap-2">
            <Link
              href="/produtos"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-text hover:text-primary hover:bg-surface-alt transition-colors min-h-[44px] flex items-center"
            >
              Produtos
            </Link>
            <Link
              href="/sobre"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-text hover:text-primary hover:bg-surface-alt transition-colors min-h-[44px] flex items-center"
            >
              Sobre
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-2.5 rounded-xl text-text hover:bg-surface-alt transition-colors"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile expanded search input */}
      {isSearchOpen && (
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-border/50 bg-surface">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="O que você procura hoje?"
              className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-alt text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="sm:hidden px-4 py-3 border-t border-border bg-surface flex flex-col gap-1 animate-in slide-in-from-top-2 duration-150">
          <Link
            href="/produtos"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-4 py-3 rounded-xl text-base font-semibold text-text hover:bg-surface-alt"
          >
            Todos os Produtos
          </Link>
          <Link
            href="/sobre"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-4 py-3 rounded-xl text-base font-semibold text-text hover:bg-surface-alt"
          >
            Sobre o Casa &amp; Conforto
          </Link>
          <Link
            href="/privacidade"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-4 py-3 rounded-xl text-base font-semibold text-text hover:bg-surface-alt"
          >
            Privacidade
          </Link>
        </div>
      )}
    </header>
  );
}

