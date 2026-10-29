"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Sparkles, Lock, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginAction(null, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/painel");
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Link para voltar ao site */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a vitrine</span>
          </Link>
        </div>

        {/* Card de Login */}
        <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-md">
          {/* Topo / Logo */}
          <div className="flex flex-col items-center text-center gap-2 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mb-1 shadow-xs">
              <Sparkles className="w-7 h-7" />
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-text">
              Painel Casa &amp; Conforto
            </h1>
            <p className="text-sm text-text-muted">
              Acesso exclusivo da administradora
            </p>
          </div>

          {/* Mensagem de Erro Geral */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-danger text-sm font-medium flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="E-mail"
              name="email"
              type="email"
              required
              autoFocus
              placeholder="admin@casaeconforto.local"
              defaultValue="admin@casaeconforto.local"
            />

            <Input
              label="Senha"
              name="senha"
              type="password"
              required
              placeholder="Digite sua senha"
              defaultValue="admin123"
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isPending}
                className="w-full"
              >
                Entrar no painel
              </Button>
            </div>
          </form>

          {/* Dica para demonstração */}
          <div className="mt-6 pt-5 border-t border-border/80 text-center">
            <p className="text-xs text-text-muted">
              Ambiente de demonstração local. <br />
              E-mail padrão: <code className="text-text font-semibold">admin@casaeconforto.local</code> <br />
              Senha padrão: <code className="text-text font-semibold">admin123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

