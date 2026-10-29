"use client";

import React, { useState, useTransition } from "react";
import { salvarConfiguracoesAction } from "@/lib/actions/produtos";
import { Checkbox } from "@/components/ui/Checkbox";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  CATEGORIAS_VALIDAS,
  CATEGORIAS_NOMES,
  CategoriaSlug,
} from "@/lib/validation";
import {
  Shield,
  Sparkles,
  Clock,
  Save,
} from "lucide-react";

interface ConfiguracoesClientProps {
  initialConfig: {
    categoriasPermitidas: string[];
    frequenciaBusca: "DIARIA" | "A_CADA_2_DIAS" | "SEMANAL";
    publicarAutomaticamente: boolean;
  };
}

export function ConfiguracoesClient({
  initialConfig,
}: ConfiguracoesClientProps) {
  const { success, error } = useToast();
  const [isPending, startTransition] = useTransition();

  const [categorias, setCategorias] = useState<string[]>(
    initialConfig.categoriasPermitidas
  );
  const [frequencia, setFrequencia] = useState<"DIARIA" | "A_CADA_2_DIAS" | "SEMANAL">(
    initialConfig.frequenciaBusca
  );
  const [publicarAuto, setPublicarAuto] = useState<boolean>(
    initialConfig.publicarAutomaticamente
  );

  const handleCategoryToggle = (slug: string) => {
    if (categorias.includes(slug)) {
      if (categorias.length === 1) {
        error("Pelo menos uma categoria deve permanecer selecionada.");
        return;
      }
      setCategorias(categorias.filter((c) => c !== slug));
    } else {
      setCategorias([...categorias, slug]);
    }
  };

  const handleSalvar = () => {
    startTransition(async () => {
      const res = await salvarConfiguracoesAction({
        categoriasPermitidas: categorias,
        frequenciaBusca: frequencia,
        publicarAutomaticamente: publicarAuto,
      });

      if (res.success) {
        success("Alterações salvas com sucesso!");
      } else {
        error(res.error || "Erro ao salvar configurações.");
      }
    });
  };

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      {/* Topo */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text">
          Configurações
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Ajuste as preferências de busca automática de produtos e curadoria assistida.
        </p>
      </div>

      {/* 1. Conta da Shopee */}
      <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-2.5 font-heading font-bold text-base text-text">
          <Shield className="w-5 h-5 text-primary" />
          <h2>Conta da Shopee</h2>
        </div>

        <p className="text-sm text-text-muted leading-relaxed">
          Modo de demonstração: os produtos e comissões são simulados.
        </p>

        <div>
          <button
            type="button"
            disabled
            className="min-h-[44px] px-4 py-2 rounded-xl bg-surface-alt text-text-muted text-xs font-semibold cursor-not-allowed border border-border"
          >
            Conectar conta da Shopee (em breve)
          </button>
        </div>
      </div>

      {/* 2. Categorias que a IA pode sugerir */}
      <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-2.5 font-heading font-bold text-base text-text">
          <Sparkles className="w-5 h-5 text-info" />
          <h2>Categorias que a IA pode sugerir</h2>
        </div>

        <p className="text-xs text-text-muted">
          Selecione os nichos de produtos que fazem sentido para a sua vitrine. A IA
          somente buscará e sugerirá itens dessas categorias (mínimo de 1).
        </p>

        <div className="flex flex-col gap-3 pt-2">
          {CATEGORIAS_VALIDAS.map((slug) => (
            <Checkbox
              key={slug}
              label={CATEGORIAS_NOMES[slug as CategoriaSlug]}
              checked={categorias.includes(slug)}
              onChange={() => handleCategoryToggle(slug)}
            />
          ))}
        </div>
      </div>

      {/* 3. Frequência da busca de novos produtos */}
      <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-2.5 font-heading font-bold text-base text-text">
          <Clock className="w-5 h-5 text-primary" />
          <h2>Frequência da busca de novos produtos</h2>
        </div>

        <p className="text-xs text-text-muted">
          Com que frequência a rotina deve consultar novas oportunidades no catálogo da Shopee.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {[
            { id: "DIARIA", label: "Todo dia (recomendado)" },
            { id: "A_CADA_2_DIAS", label: "A cada 2 dias" },
            { id: "SEMANAL", label: "Uma vez por semana" },
          ].map((op) => {
            const isSelected = frequencia === op.id;
            return (
              <button
                key={op.id}
                type="button"
                onClick={() =>
                  setFrequencia(op.id as "DIARIA" | "A_CADA_2_DIAS" | "SEMANAL")
                }
                className={`p-3.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  isSelected
                    ? "bg-primary border-primary text-white shadow-xs"
                    : "border-border bg-surface text-text hover:bg-surface-alt"
                }`}
              >
                {op.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Publicação Automática */}
      <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs flex flex-col gap-4">
        <Toggle
          label="Publicação automática"
          description="Quando ligado, novos achados sem avisos da IA vão direto para a vitrine pública sem precisar da aprovação manual."
          checked={publicarAuto}
          onChange={setPublicarAuto}
        />
      </div>

      {/* Botão Salvar Alterações */}
      <div className="pt-2">
        <Button
          variant="primary"
          size="lg"
          loading={isPending}
          onClick={handleSalvar}
          className="w-full sm:w-auto"
          icon={<Save className="w-4 h-4" />}
        >
          Salvar alterações
        </Button>
      </div>
    </div>
  );
}

