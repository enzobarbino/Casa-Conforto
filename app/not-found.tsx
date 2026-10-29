import React from "react";
import Link from "next/link";
import { Header } from "@/components/vitrine/Header";
import { Footer } from "@/components/vitrine/Footer";
import { Button } from "@/components/ui/Button";
import { PackageSearch, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-surface-alt border border-border text-text-muted flex items-center justify-center mb-5">
          <PackageSearch className="w-8 h-8 text-primary" />
        </div>
        <span className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
          Erro 404
        </span>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text mb-3">
          Achado não encontrado
        </h1>
        <p className="text-sm text-text-muted mb-8 leading-relaxed">
          O produto que você procura pode ter sido removido, a oferta expirou ou o endereço foi digitado incorretamente.
        </p>
        <Link href="/produtos">
          <Button variant="primary" size="lg" icon={<ArrowLeft className="w-4 h-4" />}>
            Explorar outros achados
          </Button>
        </Link>
      </main>
      <Footer />
    </div>
  );
}

