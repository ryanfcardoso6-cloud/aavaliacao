'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, ArrowRight, Lock, HeartHandshake } from 'lucide-react';

export default function HomePage() {
  const [storeConfig, setStoreConfig] = useState<any>(null);

  useEffect(() => {
    fetch('/api/public/configuracoes')
      .then((res) => res.json())
      .then((data) => setStoreConfig(data))
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen w-full bg-[#FAF7F0] flex flex-col justify-between p-4 sm:p-6 md:p-10 overflow-y-auto">
      <div className="max-w-md w-full mx-auto my-auto bg-white rounded-3xl shadow-xl shadow-[#1E3A24]/5 border border-[#EAE3D2] p-6 sm:p-10 text-center relative overflow-hidden">
        {/* Faixa Tricolor Italiana Borelli no Topo */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
          <div className="w-1/3 bg-[#009246]" />
          <div className="w-1/3 bg-[#FFFFFF]" />
          <div className="w-1/3 bg-[#CE2B37]" />
        </div>

        {/* Logo Gelato Borelli */}
        <div className="mb-6 flex justify-center">
          <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#EAE3D2] inline-block shadow-sm">
            <img
              src="/logo-borelli.png"
              alt="Gelato Borelli"
              className="h-20 w-auto object-contain mx-auto transition-transform hover:scale-105"
            />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A24] tracking-tight">
          {storeConfig?.storeName || 'Gelato Borelli'}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#5C665D] leading-relaxed">
          {storeConfig?.welcomeMessage || 'Como foi sua experiência na Gelato Borelli hoje?'}
        </p>

        <div className="mt-8 p-4 bg-[#FAF7F0] rounded-2xl border border-[#EAE3D2] text-left">
          <div className="flex items-center gap-2.5 text-[#1E3A24] font-bold mb-1.5 text-xs sm:text-sm">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Avaliação Rápida da sua Visita</span>
          </div>
          <p className="text-xs text-[#6B756C] leading-relaxed">
            Seja um elogio ao seu sabor favorito ou um ponto a aprimorar no atendimento, sua opinião é cuidada com carinho pela nossa equipe.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <Link
            href="/avaliar"
            className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-[#1E3A24] hover:bg-[#2A4E32] text-[#FAF7F0] font-bold text-sm sm:text-base shadow-lg shadow-[#1E3A24]/20 transition-all transform active:scale-[0.98]"
          >
            <span>Avaliar Atendimento</span>
            <ArrowRight className="w-5 h-5 text-amber-400" />
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-[#EAE3D2] flex items-center justify-between text-xs text-[#7D877E]">
          <Link
            href="/politica-de-privacidade"
            className="inline-flex items-center gap-1.5 hover:text-[#1E3A24] transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Privacidade & LGPD</span>
          </Link>

          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 hover:text-[#1E3A24] transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-[#1E3A24]" />
            <span>Acesso Equipe</span>
          </Link>
        </div>
      </div>

      <footer className="text-center text-xs text-[#7D877E] py-4">
        &copy; {new Date().getFullYear()} Gelato Borelli. O verdadeiro gelato italiano.
      </footer>
    </main>
  );
}
