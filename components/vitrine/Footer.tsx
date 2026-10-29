import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto bg-surface border-t border-border/80 pt-12 pb-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-border">
          {/* Coluna 1: Sobre */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-text font-heading font-extrabold text-lg">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Casa &amp; Conforto</span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              Curadoria dedicada a garimpar os melhores achados da Shopee para transformar
              sua casa com praticidade, bom gosto e economia.
            </p>
          </div>

          {/* Coluna 2: Aviso de Transparência e Afiliado (Obrigatório) */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-surface-alt/70 border border-border/60">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Transparência com você</span>
            </div>
            <p className="text-xs text-text font-medium leading-relaxed">
              <strong>
                Podemos receber comissão pelas compras feitas através dos nossos links,
                sem custo extra para você.
              </strong>
            </p>
            <p className="text-xs text-text-muted leading-relaxed">
              Os preços e a disponibilidade são definidos pela Shopee e podem mudar a qualquer momento.
            </p>
          </div>

          {/* Coluna 3: Links Úteis */}
          <div className="flex flex-col gap-3 md:items-end">
            <h4 className="text-sm font-bold text-text">Navegação</h4>
            <div className="flex flex-col gap-2 text-sm text-text-muted md:items-end">
              <Link href="/produtos" className="hover:text-primary transition-colors">
                Catálogo de Produtos
              </Link>
              <Link href="/sobre" className="hover:text-primary transition-colors">
                Sobre Nós
              </Link>
              <Link href="/privacidade" className="hover:text-primary transition-colors">
                Política de Privacidade
              </Link>
              <Link href="/bio" className="hover:text-primary transition-colors">
                Link da Bio (Instagram)
              </Link>
            </div>
          </div>
        </div>

        {/* Rodapé inferior */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} Casa &amp; Conforto. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1.5">
            Feito com carinho para o seu lar <Heart className="w-3.5 h-3.5 text-primary fill-primary" />
          </p>
        </div>
      </div>
    </footer>
  );
}

