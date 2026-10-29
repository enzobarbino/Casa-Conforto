import React from "react";
import Link from "next/link";
import { Sparkles, CheckCircle, ShieldCheck, ArrowRight } from "lucide-react";

export default function SobrePage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-10 sm:py-16">
      <div className="flex flex-col gap-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-xs w-fit">
          <Sparkles className="w-4 h-4" />
          <span>Nossa História &amp; Propósito</span>
        </div>

        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-text leading-tight">
          Sobre o Casa &amp; Conforto
        </h1>

        <p className="text-base sm:text-lg text-text leading-relaxed">
          O <strong>Casa &amp; Conforto</strong> nasceu com um objetivo muito simples:{" "}
          <em>descomplicar a busca por produtos que realmente valem a pena para o lar</em>.
        </p>

        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs flex flex-col gap-4">
          <h2 className="font-heading font-bold text-lg text-text">
            Como selecionamos os produtos?
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Sabemos que navegar por milhares de opções na internet pode ser cansativo.
            Por isso, nossa equipe analisa diariamente as ofertas da Shopee, avaliando
            a utilidade real de cada item, as avaliações de outros compradores e a qualidade
            dos materiais antes de trazê-lo para a nossa vitrine.
          </p>
          <ul className="flex flex-col gap-2.5 pt-2">
            {[
              "Produtos que resolvem pequenos incômodos do cotidiano",
              "Design funcional e aconchegante para todos os ambientes",
              "Custo-benefício honesto e comprovado",
              "Sem promessas exageradas — apenas o que o produto realmente entrega",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-text">
                <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-teal-50/60 border border-teal-200/60 text-text flex flex-col gap-3">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>Transparência total com nossos visitantes</span>
          </div>
          <p className="text-sm text-text-muted leading-relaxed">
            Nós não vendemos nem despachamos produtos diretamente. O Casa &amp; Conforto
            é um site parceiro e participante do Programa de Afiliados da Shopee. Quando
            você se interessa por um achado e clica em &quot;Ver oferta&quot;, nós redirecionamos
            você diretamente para a página oficial do vendedor na Shopee, onde a compra
            acontece com total segurança.
          </p>
          <p className="text-sm text-text font-medium leading-relaxed">
            Ao comprar através dos nossos links, nós podemos receber uma pequena comissão.
            Isso nos ajuda a manter a plataforma no ar e pesquisando novos achados, e{" "}
            <strong>você não paga nem um centavo a mais por isso</strong>.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/produtos"
            className="min-h-[50px] px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <span>Explorar achados agora</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/privacidade"
            className="text-sm font-semibold text-text-muted hover:text-primary transition-colors"
          >
            Ver nossa política de privacidade
          </Link>
        </div>
      </div>
    </div>
  );
}

