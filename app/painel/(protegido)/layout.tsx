import React from "react";
import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PainelNav } from "@/components/painel/PainelNav";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Painel Administrativo | Casa & Conforto",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PainelProtegidoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  // Contagem de produtos esperando revisão
  const revisarCount = await prisma.produto.count({
    where: { status: "PARA_REVISAR" },
  });

  return (
    <ToastProvider>
      <div className="min-h-screen bg-bg flex flex-col lg:flex-row">
        {/* Navegação Desktop (Sidebar) e Mobile (Bottom Bar) */}
        <PainelNav revisarCount={revisarCount} />

        {/* Conteúdo Principal */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 pb-24 lg:pb-12">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}

