import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { formatarMoeda } from "@/lib/format";
import { Sparkles, ExternalLink, ArrowRight } from "lucide-react";

export default async function BioPage() {
  // Lista vertical dos 10 produtos publicados mais recentes
  const produtos = await prisma.produto.findMany({
    where: {
      status: { in: ["NO_AR", "PRECO_MUDOU"] },
    },
    orderBy: {
      publicadoEm: "desc",
    },
    take: 10,
  });

  return (
    <div className="max-w-md mx-auto px-4 py-8 flex flex-col items-center">
      {/* Topo / Perfil */}
      <div className="flex flex-col items-center text-center gap-2.5 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary-soft text-primary flex items-center justify-center shadow-sm">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-text">
          Casa &amp; Conforto
        </h1>
        <p className="text-sm text-text-muted max-w-xs">
          Achados selecionados da Shopee para transformar a sua rotina com aconchego e praticidade.
        </p>
        <div className="flex items-center gap-1.5 text-xs text-primary font-semibold mt-1">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          <span>@casaconforto.achados</span>
        </div>
      </div>

      {/* Lista Vertical dos 10 Produtos */}
      <div className="w-full flex flex-col gap-3 mb-8">
        {produtos.map((p) => {
          let imagens: string[] = [];
          try {
            imagens = JSON.parse(p.imagens || "[]");
          } catch {
            imagens = [];
          }
          const img = imagens[0] || "/produtos/potes-hermeticos.svg";

          return (
            <div
              key={p.id}
              className="bg-surface rounded-2xl border border-border p-3 shadow-xs hover:border-primary/40 transition-all flex items-center gap-3.5"
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-alt shrink-0">
                <Image
                  src={img}
                  alt={p.titulo}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <Link
                  href={`/produtos/${p.id}?origem=bio`}
                  className="font-semibold text-xs sm:text-sm text-text hover:text-primary transition-colors line-clamp-1"
                >
                  {p.titulo}
                </Link>
                <span className="font-bold text-sm text-text mt-0.5">
                  {formatarMoeda(p.precoShopee)}
                </span>
              </div>

              <a
                href={`/ir/${p.id}?origem=bio`}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shrink-0 flex items-center gap-1 active:scale-95 transition-all shadow-xs"
              >
                <span>Ver</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          );
        })}
      </div>

      {/* Botão Final "Ver todos os achados" */}
      <Link
        href="/produtos"
        className="w-full min-h-[50px] px-6 py-3 rounded-2xl bg-surface border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-xs"
      >
        <span>Ver todos os achados do site</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
