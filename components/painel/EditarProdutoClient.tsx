"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatarMoeda, formatarData, formatarPercentual } from "@/lib/format";
import { calcularGanhoEstimado } from "@/lib/calc";
import {
  salvarProdutoAction,
  regenerarComIAAction,
  ocultarProdutoAction,
  mostrarProdutoAction,
  confirmarPrecoAction,
} from "@/lib/actions/produtos";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ProductCard } from "@/components/vitrine/ProductCard";
import { useToast } from "@/components/ui/Toast";
import {
  CATEGORIAS_VALIDAS,
  CATEGORIAS_NOMES,
} from "@/lib/validation";
import {
  Sparkles,
  ExternalLink,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Save,
} from "lucide-react";

export interface EditarProdutoProps {
  produto: {
    id: string;
    shopeeItemId: string;
    titulo: string;
    descricao: string;
    destaques: string[];
    categoria: string;
    imagens: string[];
    precoShopee: number;
    precoAnterior?: number | null;
    precoConsultadoEm: string;
    comissaoPercentual: number;
    linkOriginal: string;
    status: string;
    alertasIA: string[];
  };
}

export function EditarProdutoClient({ produto }: EditarProdutoProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const [isPending, startTransition] = useTransition();

  // Form states
  const [titulo, setTitulo] = useState(produto.titulo);
  const [descricao, setDescricao] = useState(produto.descricao);
  const [destaques, setDestaques] = useState<string[]>([
    produto.destaques[0] || "",
    produto.destaques[1] || "",
    produto.destaques[2] || "",
  ]);
  const [categoria, setCategoria] = useState(produto.categoria);
  const [status, setStatus] = useState(produto.status);
  const [isDirty, setIsDirty] = useState(false);

  // Modal confirm regeneration
  const [isRegenerarOpen, setIsRegenerarOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleFieldChange = (field: string, val: string) => {
    setIsDirty(true);
    if (field === "titulo") setTitulo(val);
    if (field === "descricao") setDescricao(val);
    if (field === "categoria") setCategoria(val);
  };

  const handleDestaqueChange = (index: number, val: string) => {
    setIsDirty(true);
    const novo = [...destaques];
    novo[index] = val;
    setDestaques(novo);
  };

  const categoriaOptions = CATEGORIAS_VALIDAS.map((slug) => ({
    value: slug,
    label: CATEGORIAS_NOMES[slug],
  }));

  // Salvar
  const handleSalvar = (publicarAposSalvar: boolean = false) => {
    if (!titulo.trim()) {
      error("O título é obrigatório.");
      return;
    }
    if (titulo.length > 70) {
      error("O título pode ter no máximo 70 caracteres.");
      return;
    }
    if (descricao.trim().length < 20) {
      error("A descrição deve ter pelo menos 20 caracteres.");
      return;
    }
    if (destaques.some((d) => !d.trim())) {
      error("Preencha todos os 3 destaques.");
      return;
    }

    startTransition(async () => {
      const res = await salvarProdutoAction({
        id: produto.id,
        titulo,
        descricao,
        destaques,
        categoria,
        publicarAposSalvar,
      });

      if (res.success) {
        setIsDirty(false);
        if (res.novoStatus) setStatus(res.novoStatus);
        success(
          publicarAposSalvar
            ? "Produto salvo e publicado na vitrine!"
            : "Alterações salvas com sucesso!"
        );
        router.refresh();
      } else {
        error(res.error || "Erro ao salvar alterações.");
      }
    });
  };

  // Confirmar novo preço
  const handleConfirmarPreco = () => {
    startTransition(async () => {
      const res = await confirmarPrecoAction(produto.id);
      if (res.success) {
        setStatus("NO_AR");
        success("Novo preço confirmado! Produto atualizado na vitrine.");
        router.refresh();
      } else {
        error(res.error || "Erro ao confirmar preço.");
      }
    });
  };

  // Alternar Ocultar / Mostrar
  const handleToggleOcultar = () => {
    startTransition(async () => {
      if (status === "OCULTO") {
        const res = await mostrarProdutoAction(produto.id);
        if (res.success) {
          setStatus("NO_AR");
          success("Produto agora está no ar na vitrine!");
          router.refresh();
        } else {
          error(res.error || "Erro ao mostrar produto.");
        }
      } else {
        const res = await ocultarProdutoAction(produto.id);
        if (res.success) {
          setStatus("OCULTO");
          success("Produto ocultado da vitrine.");
          router.refresh();
        } else {
          error(res.error || "Erro ao ocultar produto.");
        }
      }
    });
  };

  // Regenerar com IA
  const handleConfirmarRegenerar = async () => {
    setIsRegenerating(true);
    const res = await regenerarComIAAction(produto.id);
    setIsRegenerating(false);
    setIsRegenerarOpen(false);

    if (res.success && res.conteudo) {
      setTitulo(res.conteudo.titulo);
      setDescricao(res.conteudo.descricao);
      setDestaques(res.conteudo.destaques);
      if (res.conteudo.categoria) setCategoria(res.conteudo.categoria);
      setIsDirty(true);
      success("Novo conteúdo gerado com IA! Revise e clique em Salvar.");
    } else {
      error("Não foi possível gerar novos textos com IA.");
    }
  };

  const ganho = calcularGanhoEstimado(
    produto.precoShopee,
    produto.comissaoPercentual
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Topo / Voltar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/painel/produtos"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Meus produtos</span>
        </Link>

        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          {isDirty && (
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Alterações não salvas
            </span>
          )}
        </div>
      </div>

      {/* Alertas da IA no Topo em Caixa Amarela */}
      {produto.alertasIA && produto.alertasIA.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-warning block mb-0.5">
              Avisos da Inteligência Artificial:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-xs sm:text-sm">
              {produto.alertasIA.map((alerta, i) => (
                <li key={i}>{alerta}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Grid Principal: Formulário de Edição + Pré-visualização */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUNA ESQUERDA: FORMULÁRIO (8 colunas) */}
        <div className="lg:col-span-7 flex flex-col gap-6 bg-surface rounded-2xl border border-border p-5 sm:p-7 shadow-xs">
          {/* Ações Especiais de Status */}
          {status === "PRECO_MUDOU" && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-sm text-warning">
                  O preço deste produto mudou na Shopee.
                </span>
                <p className="text-xs text-text-muted">
                  Preço anterior: {formatarMoeda(produto.precoAnterior || 0)} → Novo preço: {formatarMoeda(produto.precoShopee)}
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleConfirmarPreco}
                disabled={isPending}
              >
                Confirmar novo preço
              </Button>
            </div>
          )}

          {/* Dados Somente Leitura da Shopee */}
          <div className="p-4 rounded-xl bg-surface-alt/70 border border-border/80 flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Dados da Shopee (Somente leitura)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-text-muted block">Preço na Shopee</span>
                <strong className="text-sm font-bold text-text">
                  {formatarMoeda(produto.precoShopee)}
                </strong>
              </div>
              <div>
                <span className="text-text-muted block">Comissão</span>
                <strong className="text-sm font-bold text-text">
                  {formatarPercentual(produto.comissaoPercentual)}
                </strong>
              </div>
              <div>
                <span className="text-text-muted block">Você ganha por venda</span>
                <strong className="text-sm font-bold text-primary">
                  {formatarMoeda(ganho)}
                </strong>
              </div>
              <div>
                <span className="text-text-muted block">Consultado em</span>
                <strong className="text-sm font-bold text-text">
                  {formatarData(produto.precoConsultadoEm)}
                </strong>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-border/60">
              <span className="text-xs text-text-muted truncate max-w-xs">
                Link original: {produto.linkOriginal}
              </span>
              <a
                href={produto.linkOriginal}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 shrink-0 ml-2"
              >
                <span>Abrir na Shopee</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Botão Gerar Novamente com IA */}
          <div className="flex justify-end">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsRegenerarOpen(true)}
              icon={<Sparkles className="w-4 h-4 text-info" />}
            >
              Gerar novamente com IA
            </Button>
          </div>

          {/* Campos Editáveis */}
          <div className="flex flex-col gap-4">
            {/* Título com Contador */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-text">Título</label>
                <span
                  className={`text-xs ${
                    titulo.length > 70 ? "text-danger font-bold" : "text-text-muted"
                  }`}
                >
                  {titulo.length}/70 caracteres
                </span>
              </div>
              <input
                type="text"
                value={titulo}
                onChange={(e) => handleFieldChange("titulo", e.target.value)}
                maxLength={70}
                className="min-h-[44px] px-3.5 py-2 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Categoria */}
            <Select
              label="Categoria"
              options={categoriaOptions}
              value={categoria}
              onChange={(e) => handleFieldChange("categoria", e.target.value)}
            />

            {/* Descrição */}
            <Textarea
              label="Descrição"
              rows={4}
              value={descricao}
              onChange={(e) => handleFieldChange("descricao", e.target.value)}
              helperText={`Mínimo de 20 caracteres (${descricao.length} digitados)`}
            />

            {/* 3 Destaques */}
            <div className="flex flex-col gap-2 pt-1">
              <label className="text-sm font-semibold text-text">
                3 Destaques Principais (máx. 40 caracteres cada)
              </label>
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-muted w-4">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={destaques[idx] || ""}
                    onChange={(e) => handleDestaqueChange(idx, e.target.value)}
                    maxLength={40}
                    placeholder={`Destaque ${idx + 1}`}
                    className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-xs text-text-muted w-10 text-right">
                    {(destaques[idx] || "").length}/40
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Barra de Ações do Formulário */}
          <div className="pt-6 border-t border-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {status === "PARA_REVISAR" ? (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  loading={isPending}
                  onClick={() => handleSalvar(true)}
                  icon={<CheckCircle className="w-4 h-4" />}
                >
                  Salvar e publicar
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  loading={isPending}
                  onClick={() => handleSalvar(false)}
                  icon={<Save className="w-4 h-4" />}
                >
                  Salvar alterações
                </Button>
              )}
            </div>

            {/* Ocultar ou Mostrar */}
            {status !== "PARA_REVISAR" && status !== "IGNORADO" && (
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleToggleOcultar}
                disabled={isPending}
                icon={
                  status === "OCULTO" ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )
                }
              >
                {status === "OCULTO" ? "Mostrar na vitrine" : "Ocultar da vitrine"}
              </Button>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: PRÉ-VISUALIZAÇÃO EM TEMPO REAL (5 colunas) */}
        <div className="lg:col-span-5 flex flex-col gap-3 sticky top-24">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-primary" />
              <span>Pré-visualização do card na vitrine</span>
            </span>
            <span className="text-[11px] text-text-muted">Atualiza ao digitar</span>
          </div>

          {/* Card Mock da Vitrine */}
          <div className="max-w-xs mx-auto w-full">
            <ProductCard
              id={produto.id}
              titulo={titulo || "Título do produto..."}
              precoShopee={produto.precoShopee}
              precoAnterior={produto.precoAnterior}
              imagem={produto.imagens[0]}
              categoria={categoria}
              status={status}
              origem="painel"
            />
          </div>

          {/* Destaques Prévia */}
          <div className="bg-surface rounded-2xl border border-border p-4 shadow-xs mt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 block">
              Destaques na página do produto:
            </span>
            <ul className="flex flex-col gap-1.5 text-xs text-text">
              {destaques.map((d, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{d || "(Destaque não preenchido)"}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Dialog para Regenerar com IA */}
      <ConfirmDialog
        isOpen={isRegenerarOpen}
        onClose={() => setIsRegenerarOpen(false)}
        onConfirm={handleConfirmarRegenerar}
        loading={isRegenerating}
        title="Gerar novos textos com IA?"
        description="Esta ação irá substituir o título, a descrição e os 3 destaques pelas novas sugestões da inteligência artificial. Você ainda poderá editar antes de salvar."
        confirmLabel="Sim, gerar com IA"
        cancelLabel="Cancelar"
        variant="primary"
      />
    </div>
  );
}

