import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Price } from "@/components/ui/Price";
import { Badge } from "@/components/ui/Badge";

export interface ProductCardProps {
  id: string;
  titulo: string;
  precoShopee: number;
  precoAnterior?: number | null;
  imagem: string;
  categoria?: string;
  status: string;
  origem?: string;
}

export function ProductCard({
  id,
  titulo,
  precoShopee,
  precoAnterior,
  imagem,
  status,
  origem = "site",
}: ProductCardProps) {
  const isPrecoMudou = status === "PRECO_MUDOU";

  return (
    <div className="group relative bg-surface rounded-2xl border border-border/70 hover:border-primary/40 shadow-sm hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] transition-all duration-200 flex flex-col overflow-hidden">
      {/* Imagem do produto com link */}
      <Link
        href={`/produtos/${id}`}
        className="relative block w-full aspect-square overflow-hidden bg-surface-alt"
      >
        <Image
          src={imagem || "/produtos/potes-hermeticos.svg"}
          alt={titulo}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badge flutuante de Preço mudou */}
        {isPrecoMudou && (
          <div className="absolute top-2.5 left-2.5">
            <Badge variant="warning" className="shadow-xs text-[11px] font-bold">
              Preço mudou
            </Badge>
          </div>
        )}
      </Link>

      {/* Conteúdo */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        <Link
          href={`/produtos/${id}`}
          className="font-heading font-semibold text-sm sm:text-base text-text group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-3"
          title={titulo}
        >
          {titulo}
        </Link>

        {/* Preço e Botão Ver Oferta */}
        <div className="mt-auto pt-2 flex flex-col gap-2.5">
          <Price
            value={precoShopee}
            originalValue={precoAnterior}
            size="md"
          />

          <a
            href={`/ir/${id}?origem=${encodeURIComponent(origem)}`}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98] shadow-xs"
          >
            <span>Ver oferta na Shopee</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

