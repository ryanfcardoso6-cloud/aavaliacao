'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, HeartHandshake, Loader2, RotateCcw } from 'lucide-react';

function SucessoContent() {
  const searchParams = useSearchParams();
  const rating = parseInt(searchParams.get('nota') || '5');
  const mesaToken = searchParams.get('mesa');

  const isPositive = rating >= 4;

  const returnUrl = mesaToken ? `/avaliar?mesa=${mesaToken}` : '/avaliar';

  return (
    <div className="max-w-md w-full mx-auto my-auto bg-white rounded-3xl shadow-xl shadow-[#1E3A24]/5 border border-[#EAE3D2] p-6 sm:p-10 text-center relative overflow-hidden">
      {/* Faixa Tricolor Italiana Borelli */}
      <div className="absolute top-0 left-0 right-0 h-1.5 flex">
        <div className="w-1/3 bg-[#009246]" />
        <div className="w-1/3 bg-[#FFFFFF]" />
        <div className="w-1/3 bg-[#CE2B37]" />
      </div>

      {/* Logo Gelato Borelli */}
      <div className="mb-4 flex justify-center">
        <div className="p-2.5 bg-[#FAF7F0] rounded-2xl border border-[#EAE3D2] inline-block shadow-sm">
          <img
            src="/logo-borelli.png"
            alt="Gelato Borelli"
            className="h-16 w-auto object-contain mx-auto"
          />
        </div>
      </div>

      {/* Ícone de Sucesso */}
      <div className="w-16 h-16 mx-auto bg-[#F4F7F4] text-[#1E3A24] rounded-2xl flex items-center justify-center mb-4 border border-[#CBD8CB]">
        <CheckCircle2 className="w-10 h-10 text-[#1E3A24]" />
      </div>

      <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E3A24] tracking-tight">
        {isPositive ? 'Avaliação Recebida com Sucesso!' : 'Mensagem Recebida com Sucesso!'}
      </h1>

      <p className="mt-3 text-xs sm:text-sm text-[#5C665D] leading-relaxed">
        {isPositive
          ? 'Molto grazie! Sua opinião foi registrada com carinho e compartilhada com toda a nossa equipe da Gelato Borelli.'
          : 'Agradecemos por nos avisar. Seu relato foi recebido diretamente pela nossa gerência para cuidarmos com total atenção e prioridade.'}
      </p>

      {/* Bloco de Mensagem Calorosa */}
      <div className="mt-6 p-4 bg-[#FAF7F0] rounded-2xl border border-[#EAE3D2] text-center">
        <div className="flex items-center justify-center gap-2 text-[#1E3A24] font-bold text-xs sm:text-sm mb-1">
          <HeartHandshake className="w-4 h-4 text-[#CE2B37]" />
          <span>Gelato Borelli Agradece!</span>
        </div>
        <p className="text-xs text-[#6B756C] leading-relaxed">
          Pode fechar esta página no seu celular. Desejamos que você tenha um momento muito especial e saboroso conosco!
        </p>
      </div>

      {/* Botão sutil caso queira avaliar novamente (NÃO vai para o admin) */}
      <div className="mt-6">
        <Link
          href={returnUrl}
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-2xl bg-[#FAF7F0] hover:bg-[#EAE3D2] text-[#1E3A24] font-semibold text-xs border border-[#CBD8CB] transition"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#1E3A24]" />
          <span>Fazer nova avaliação</span>
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
