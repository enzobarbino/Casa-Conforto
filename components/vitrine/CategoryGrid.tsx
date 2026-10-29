import React from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Bath,
  Sparkles,
  Zap,
  LayoutGrid,
} from "lucide-react";

const categorias = [
  {
    slug: "cozinha-mesa",
    nome: "Cozinha & Mesa",
    icon: UtensilsCrossed,
    cor: "bg-teal-50 text-teal-700 border-teal-200/60",
  },
  {
    slug: "conforto-banho",
    nome: "Conforto & Banho",
    icon: Bath,
    cor: "bg-blue-50 text-blue-700 border-blue-200/60",
  },
  {
    slug: "decoracao-aromas",
    nome: "Decoração & Aromas",
    icon: Sparkles,
    cor: "bg-purple-50 text-purple-700 border-purple-200/60",
  },
  {
    slug: "utilidades",
    nome: "Utilidades Inteligentes",
    icon: Zap,
    cor: "bg-amber-50 text-amber-700 border-amber-200/60",
  },
  {
    slug: "organizacao",
    nome: "Organização & Casa",
    icon: LayoutGrid,
    cor: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  },
];

export function CategoryGrid() {
  return (
    <div className="w-full">
      {/* Mobile: scroll horizontal / Desktop: grade 5 colunas */}
      <div className="flex md:grid md:grid-cols-5 gap-3 sm:gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-none snap-x snap-mandatory">
        {categorias.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.slug}
              href={`/produtos?categoria=${cat.slug}`}
              className="min-w-[140px] md:min-w-0 snap-start flex-1 p-4 rounded-2xl bg-surface border border-border/80 hover:border-primary/50 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col items-center text-center gap-2.5 group"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center border ${cat.cor} group-hover:scale-110 transition-transform duration-200`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className="font-heading font-semibold text-xs sm:text-sm text-text group-hover:text-primary transition-colors">
                {cat.nome}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

