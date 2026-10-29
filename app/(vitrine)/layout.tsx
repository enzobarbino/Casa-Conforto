import React from "react";
import { Header } from "@/components/vitrine/Header";
import { Footer } from "@/components/vitrine/Footer";

export default function VitrineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

