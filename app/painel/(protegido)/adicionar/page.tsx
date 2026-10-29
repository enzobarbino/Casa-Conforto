"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adicionarPorLinkAction } from "@/lib/actions/produtos";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function AdicionarProdutoPage() {
  const router = useRouter();
  const { success } = useToast();

  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [existenteId, setExistenteId] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<"idle" | "buscando" | "escrevendo">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setError(null);
    setExistenteId(null);
    setEtapa("buscando");

    // Simula transição visual das etapas de carregamento
    const timer = setTimeout(() => {
      setEtapa("escrevendo");
    }, 1200);

    const res = await adicionarPorLinkAction(url.trim());
    clearTimeout(timer);

    if (res.success && res.produtoId) {
      success("Produto adicionado! Você já pode revisar os detalhes.");
      router.push(`/painel/produtos/${res.produtoId}`);
    } else {
      setEtapa("idle");
      setError(res.error || "Ocorreu um erro ao adicionar o produto.");
      if (res.produtoId) {
        setExistenteId(res.produtoId);
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6 py-4">
      {/* Cabeçalho */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text">
          Adicionar novo achado
        </h1>
        <p className="text-sm text-text-muted mt-1 leading-relaxed">
          Cole o link de um produto da Shopee. A inteligência artificial preenche o resto para você.
        </p>
      </div>

      {/* Card do Formulário */}
      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Link do produto na Shopee"
            placeholder="Ex.: https://shopee.com.br/product/..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
              setExistenteId(null);
            }}
            disabled={etapa !== "idle"}
            helperText="Aceita links de produtos dos domínios shopee.com.br ou shp.ee"
          />

          {/* Etapas de Carregamento com Feedback Visual */}
          {etapa !== "idle" && (
            <div className="p-4 rounded-xl bg-primary-soft/50 border border-primary/20 flex flex-col gap-2">
              <div className="flex items-center gap-2.5 text-primary text-sm font-semibold">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>
                  {etapa === "buscando"
                    ? "Buscando produto na Shopee..."
                    : "Escrevendo a descrição e os destaques com IA..."}
                </span>
              </div>
              <p className="text-xs text-text-muted pl-6.5">
                Isso leva poucos segundos. Estamos extraindo fotos e preparando os textos.
              </p>
            </div>
          )}

          {/* Mensagem de Erro ou Produto Já Existente */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-danger text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-bold">{error}</span>
                {existenteId && (
                  <Link
                    href={`/painel/produtos/${existenteId}`}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mt-1"
                  >
                    Ver produto cadastrado <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={etapa !== "idle"}
              disabled={!url.trim()}
              className="w-full"
              icon={<Sparkles className="w-4 h-4" />}
            >
              Buscar e gerar produto
            </Button>
          </div>
        </form>

        {/* Links rápidos para teste / demonstração */}
        <div className="mt-8 pt-6 border-t border-border/80 flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Sugestão de teste para demonstração:
          </span>
          <button
            type="button"
            onClick={() => setUrl("https://shopee.com.br/product/12345/678901")}
            className="text-xs text-left text-primary hover:underline font-mono bg-surface-alt p-2 rounded-lg truncate"
          >
            https://shopee.com.br/product/12345/678901
          </button>
        </div>
      </div>
    </div>
  );
}

