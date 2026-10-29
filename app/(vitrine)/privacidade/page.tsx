import React from "react";
import Link from "next/link";
import { Shield, Lock, EyeOff, ArrowLeft } from "lucide-react";

export default function PrivacidadePage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-10 sm:py-16">
      <div className="flex flex-col gap-6">
        <div className="mb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao início</span>
          </Link>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-xs w-fit">
          <Shield className="w-4 h-4" />
          <span>Privacidade &amp; Segurança</span>
        </div>

        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-text leading-tight">
          Política de Privacidade
        </h1>

        <p className="text-sm sm:text-base text-text-muted leading-relaxed">
          No <strong>Casa &amp; Conforto</strong>, respeitamos profundamente a sua
          privacidade. Esta página explica de forma clara, simples e direta como as
          informações são tratadas durante sua visita ao nosso site.
        </p>

        {/* Bloco 1: O que coletamos */}
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs flex flex-col gap-3">
          <div className="flex items-center gap-2.5 font-heading font-bold text-base text-text">
            <Lock className="w-5 h-5 text-primary" />
            <h2>Não coletamos dados pessoais de visitantes</h2>
          </div>
          <p className="text-sm text-text-muted leading-relaxed">
            Você pode navegar livremente pelo site sem criar nenhuma conta, sem fornecer
            seu nome, e-mail, telefone, CPF ou dados de pagamento. Não possuímos formulários
            de cadastro nem áreas restritas para visitantes.
          </p>
        </div>

        {/* Bloco 2: Como funcionam os cliques */}
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs flex flex-col gap-3">
          <div className="flex items-center gap-2.5 font-heading font-bold text-base text-text">
            <EyeOff className="w-5 h-5 text-primary" />
            <h2>Registro anônimo de cliques</h2>
          </div>
          <p className="text-sm text-text-muted leading-relaxed">
            Quando você clica em &quot;Ver oferta na Shopee&quot;, nosso sistema registra apenas
            estatísticas genéricas e estritamente anônimas: a <strong>data e horário</strong>,
            o <strong>produto clicado</strong> e a <strong>origem do clique</strong> (por exemplo,
            se você acessou pelo nosso site, por um link de WhatsApp ou pelo Instagram).
          </p>
          <p className="text-sm text-text-muted leading-relaxed">
            Esse registro nos ajuda unicamente a saber quais produtos são mais interessantes
            para nossa comunidade e manter o catálogo atualizado.
          </p>
        </div>

        {/* Bloco 3: Cookies e links externos */}
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs flex flex-col gap-3">
          <h2 className="font-heading font-bold text-base text-text">
            Cookies e links da Shopee
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Não utilizamos cookies de rastreamento invasivos nem compartilhamos informações
            com redes de publicidade de terceiros.
          </p>
          <p className="text-sm text-text-muted leading-relaxed">
            Ao clicar em um link para ir à Shopee, você será direcionado para o site ou
            aplicativo da Shopee. A partir desse momento, as transações, dados de pagamento
            e políticas de navegação passam a ser regidas pelos Termos de Uso e Política de
            Privacidade da própria Shopee.
          </p>
        </div>

        <p className="text-xs text-text-muted pt-4">
          Última atualização: {new Date().getFullYear()}. Em caso de dúvidas, consulte nossa página{" "}
          <Link href="/sobre" className="text-primary hover:underline font-semibold">
            Sobre Nós
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

