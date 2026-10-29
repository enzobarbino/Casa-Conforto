"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatarMoeda, formatarPercentual } from "@/lib/format";
import { calcularGanhoEstimado } from "@/lib/calc";
import {
  publicarProdutoAction,
  ignorarProdutoAction,
  togglePublicarAutomaticamenteAction,
} from "@/lib/actions/produtos";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import {
  AlertTriangle,
  Check,
  Edit3,
  Trash2,
  CheckCircle2,
  Compass,
} from "lucide-react";

export interface RevisarProdutoItem {
  id: string;
  titulo: string;
  descricao: string;
  precoShopee: number;
  comissaoPercentual: number;
  categoria: string;
  imagens: string[];
  alertasIA: string[];
}

interface RevisarClientProps {
  initialItems: RevisarProdutoItem[];
  initialPublicarAuto: boolean;
}

export function RevisarClient({
  initialItems,
  initialPublicarAuto,
}: RevisarClientProps) {
  const { success, error } = useToast();
  const [items, setItems] = useState<RevisarProdutoItem[]>(initialItems);
  const [publicarAuto, setPublicarAuto] = useState(initialPublicarAuto);
  const [isPending, startTransition] = useTransition();

  // State for confirm dialog (Ignorar)
  const [ignorarTargetId, setIgnorarTargetId] = useState<string | null>(null);
  const [isIgnorando, setIsIgnorando] = useState(false);

  // Toggle publicar automaticamente
  const handleToggleAuto = (checked: boolean) => {
    setPublicarAuto(checked);
    startTransition(async () => {
      const res = await togglePublicarAutomaticamenteAction(checked);
      if (res.success) {
        success(
          checked
            ? "Publicação automática ativada!"
            : "Publicação automática desativada."
        );
      } else {
        error("Erro ao salvar configuração.");
        setPublicarAuto(!checked);
      }
    });
  };

  // Publicar produto
  const handlePublicar = (id: string) => {
    startTransition(async () => {
      const res = await publicarProdutoAction(id);
      if (res.success) {
        success("Produto publicado na vitrine!");
        setItems((prev) => prev.filter((p) => p.id !== id));
      } else {
        error(res.error || "Não foi possível publicar o produto.");
      }
    });
  };

  // Confirmar Ignorar
  const handleConfirmarIgnorar = async () => {
    if (!ignorarTargetId) return;
    setIsIgnorando(true);
    const res = await ignorarProdutoAction(ignorarTargetId);
    setIsIgnorando(false);
    setIgnorarTargetId(null);

    if (res.success) {
      success("Produto ignorado com sucesso.");
      setItems((prev) => prev.filter((p) => p.id !== ignorarTargetId));
    } else {
      error(res.error || "Não foi possível ignorar o produto.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Topo: Título + Contador + Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text">
            Para revisar
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {items.length === 1
              ? "1 achado esperando você"
              : `${items.length} achados esperando você`}
          </p>
        </div>

        {/* Interruptor Publicar Automaticamente */}
        <div className="bg-surface rounded-2xl border border-border p-3 px-4 shadow-xs max-w-sm">
          <Toggle
            label="Publicar automaticamente"
            description="Novos achados sem avisos da IA vão direto para a vitrine."
            checked={publicarAuto}
            onChange={handleToggleAuto}
          />
        </div>
      </div>

      {/* Lista de Cards ou Estado Vazio */}
      {items.length > 0 ? (
        <div className="flex flex-col gap-5">
          {items.map((prod) => {
            const ganho = calcularGanhoEstimado(
              prod.precoShopee,
              prod.comissaoPercentual
            );
            const img = prod.imagens[0] || "/produtos/potes-hermeticos.svg";

            return (
              <div
                key={prod.id}
                className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-xs flex flex-col md:flex-row gap-5 transition-all duration-200 hover:shadow-md"
              >
                {/* Foto */}
                <div className="relative w-full md:w-44 aspect-square rounded-xl overflow-hidden bg-surface-alt border border-border/60 shrink-0">
                  <Image
                    src={img}
                    alt={prod.titulo}
                    fill
                    sizes="176px"
                    className="object-cover"
                  />
                </div>

                {/* Detalhes */}
                <div className="flex flex-col flex-1 gap-3">
                  <h3 className="font-heading font-bold text-base sm:text-lg text-text">
                    {prod.titulo}
                  </h3>

                  {/* Preço, Comissão e Ganho */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 p-3 rounded-xl bg-surface-alt/70 text-xs sm:text-sm">
                    <div>
                      <span className="text-text-muted">Preço na Shopee: </span>
                      <strong className="text-text font-bold">
                        {formatarMoeda(prod.precoShopee)}
                      </strong>
                    </div>

                    <div className="text-border">•</div>

                    <div>
                      <span className="text-text-muted">Comissão: </span>
                      <strong className="text-text font-bold">
                        {formatarPercentual(prod.comissaoPercentual)}
                      </strong>
                    </div>

                    <div className="text-border">•</div>

                    <div className="text-primary font-bold">
                      Você ganha cerca de {formatarMoeda(ganho)} por venda
                    </div>
                  </div>

                  {/* Alertas da IA em caixa amarela com ícone */}
                  {prod.alertasIA && prod.alertasIA.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-warning">
                          Aviso da inteligência artificial:
                        </span>
                        {prod.alertasIA.map((alerta, i) => (
                          <span key={i}>{alerta}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botões Grandes: Publicar (primário), Editar (secundário) e Ignorar (ghost) */}
                  <div className="mt-auto pt-3 flex flex-wrap items-center gap-3">
                    <Button
                      variant="primary"
                      size="lg"
                      disabled={isPending}
                      onClick={() => handlePublicar(prod.id)}
                      icon={<Check className="w-4 h-4 stroke-[3]" />}
                    >
                      Publicar na vitrine
                    </Button>

                    <Link href={`/painel/produtos/${prod.id}`}>
                      <Button
                        variant="secondary"
                        size="lg"
                        icon={<Edit3 className="w-4 h-4" />}
                      >
                        Editar detalhes
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="lg"
                      className="text-text-muted hover:text-danger ml-auto"
                      onClick={() => setIgnorarTargetId(prod.id)}
                      icon={<Trash2 className="w-4 h-4" />}
                    >
                      Ignorar
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<CheckCircle2 className="w-8 h-8 text-success" />}
          title="Tudo revisado!"
          description="Novos achados aparecem aqui automaticamente. Você também pode buscar novos produtos agora mesmo no catálogo da Shopee."
          action={
            <Link href="/painel/descobrir">
              <Button variant="primary" icon={<Compass className="w-4 h-4" />}>
                Descobrir produtos
              </Button>
            </Link>
          }
        />
      )}

      {/* Modal de Confirmação para Ignorar Produto */}
      <ConfirmDialog
        isOpen={Boolean(ignorarTargetId)}
        onClose={() => setIgnorarTargetId(null)}
        onConfirm={handleConfirmarIgnorar}
        loading={isIgnorando}
        title="Deseja ignorar este achado?"
        description="Este produto será marcado como ignorado e não será publicado na vitrine."
        confirmLabel="Sim, ignorar"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </div>
  );
}

