"use client";

import React, { useState } from "react";
import Image from "next/image";

export interface ProductGalleryProps {
  imagens: string[];
  titulo: string;
}

export function ProductGallery({ imagens, titulo }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const imgs = imagens.length > 0 ? imagens : ["/produtos/potes-hermeticos.svg"];

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Imagem Principal */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-surface-alt border border-border/80 shadow-xs">
        <Image
          src={imgs[selectedIndex]}
          alt={`${titulo} - Imagem ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />

        {/* Indicador no mobile se houver mais de 1 imagem */}
        {imgs.length > 1 && (
          <div className="sm:hidden absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-xs">
            {selectedIndex + 1} / {imgs.length}
          </div>
        )}
      </div>

      {/* Miniaturas (Desktop e Mobile) */}
      {imgs.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {imgs.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                selectedIndex === idx
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border/80 opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`Miniatura ${idx + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

