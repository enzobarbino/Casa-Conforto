"use client";

import React, { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { formatarMoeda } from "@/lib/format";

export interface StickyMobileBarProps {
  produtoId: string;
  preco: number;
  origem: string;
}

export function StickyMobileBar({
  produtoId,
  preco,
  origem,
}: StickyMobileBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Aparece após rolar ~350px (após o botão principal)
      if (window.scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border p-3 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex flex-col">
          <span className="text-[11px] text-text-muted font-medium">Preço</span>
          <span className="text-base font-extrabold text-text">
            {formatarMoeda(preco)}
          </span>
        </div>

        <a
          href={`/ir/${produtoId}?origem=${encodeURIComponent(origem)}`}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] shadow-xs"
        >
          <span>Ver oferta na Shopee</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

