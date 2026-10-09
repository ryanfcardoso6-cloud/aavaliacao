'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Copy, Check, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';

function SucessoContent() {
  const searchParams = useSearchParams();
  const protocol = searchParams.get('protocolo') || 'PRT-REGISTRADO';
  const rating = parseInt(searchParams.get('nota') || '5');

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(protocol);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const isPositive = rating >= 4;

  return (
    <div className="max-w-md w-full mx-auto my-auto bg-white rounded-3xl shadow-xl shadow-[#1E3A24]/5 border border-[#EAE3D2] p-6 sm:p-10 text-center relative overflow-hidden">
      {/* Faixa Tricolor Italiana */}
      <div className="absolute top-0 left-0 right-0 h-1.5 flex">
        <div className="w-1/3 bg-[#009246]" />
        <div className="w-1/3 bg-[#FFFFFF]" />
        <div className="w-1/3 bg-[#CE2B37]" />
      </div>

      <div className="mb-4 flex justify-center">
        <div className="p-2 bg-[#FAF7F0] rounded-2xl border border-[#EAE3D2] inline-block">
          <img
            src="/logo-borelli.png"
            alt="Gelato Borelli"
            className="h-16 w-auto object-contain mx-auto"
          />
        </div>
      </div>

      <div className="w-16 h-16 mx-auto bg-[#F4F7F4] text-[#1E3A24] rounded-2xl flex items-center justify-center mb-4 border border-[#CBD8CB]">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E3A24] tracking-tight">
        {isPositive ? 'Molto Grazie! Feedback Recebido' : 'Obrigado por nos avisar!'}
      </h1>

      <p className="mt-2 text-xs sm:text-sm text-[#5C665D] leading-relaxed">
        {isPositive
          ? 'Sua avaliação foi repassada com entusiasmo para nossos mestres gelatieres e equipe de atendimento da Gelato Borelli!'
          : 'Sua mensagem foi registrada em canal prioritário. Nossa gerência já foi notificada para analisar o ocorrido e prestar o devido suporte.'}
      </p>

      {/* Protocolo */}
      <div className="mt-6 p-4 bg-[#FAF7F0] rounded-2xl border border-[#EAE3D2] text-left">
        <span className="text-[11px] font-bold text-[#7D877E] uppercase tracking-wider block">
          Protocolo de Atendimento
        </span>
        <div className="mt-1.5 flex items-center justify-between gap-3 bg-white px-3 py-2 rounded-xl border border-[#EAE3D2]">
          <span className="font-mono text-sm font-bold text-[#1E3A24] tracking-wider">
            {protocol}
          </span>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF7F0] hover:bg-[#EAE3D2] text-xs font-semibold text-[#1E3A24] transition"
            title="Copiar protocolo"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
        <p className="text-[10px] text-[#7D877E] mt-1.5">
          Guarde este código para qualquer contato futuro com nossa gerência.
        </p>
      </div>

      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-[#1E3A24] hover:bg-[#2A4E32] text-[#FAF7F0] font-bold text-sm shadow transition active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Voltar ao Início</span>
        </Link>
      </div>

      <div className="mt-6 pt-4 border-t border-[#EAE3D2] flex items-center justify-center gap-2 text-xs text-[#7D877E]">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Seus dados são protegidos sob a LGPD</span>
      </div>
    </div>
  );
}

export default function SucessoPage() {
  return (
    <main className="min-h-screen bg-[#FAF7F0] flex flex-col justify-between p-4 sm:p-6 md:p-10">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20 text-[#1E3A24]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        }
      >
        <SucessoContent />
      </Suspense>

      <footer className="text-center text-xs text-[#7D877E] py-4">
        &copy; {new Date().getFullYear()} Gelato Borelli. O verdadeiro gelato italiano.
      </footer>
    </main>
  );
}
