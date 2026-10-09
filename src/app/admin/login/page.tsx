'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, Utensils, ShieldCheck } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Credenciais inválidas');
        setIsLoading(false);
        return;
      }

      router.push(redirectTo);
    } catch {
      setErrorMessage('Erro de comunicação com o servidor');
      setIsLoading(false);
    }
  };

  const fillQuickCredentials = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col justify-center items-center p-4 sm:p-6 select-none overflow-y-auto">
      <div className="max-w-md w-full bg-white border border-[#EAE3D2] rounded-3xl p-6 sm:p-10 shadow-xl shadow-[#1E3A24]/5 relative overflow-hidden my-auto">
        {/* Faixa Tricolor Italiana */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
          <div className="w-1/3 bg-[#009246]" />
          <div className="w-1/3 bg-[#FFFFFF]" />
          <div className="w-1/3 bg-[#CE2B37]" />
        </div>

        {/* Header Gelato Borelli */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#EAE3D2] inline-block shadow-sm">
              <img
                src="/logo-borelli.png"
                alt="Gelato Borelli"
                className="h-16 w-auto object-contain mx-auto"
              />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1E3A24] tracking-tight">
            Gestão Gelato Borelli
          </h1>
          <p className="text-xs sm:text-sm text-[#5C665D] mt-1">
            Painel corporativo de ouvidoria e atendimento ao cliente
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1E3A24] mb-1.5">
              E-mail corporativo
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@loja.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAF7F0]/40 border border-[#CBD8CB] text-[#1E3A24] text-sm placeholder-slate-400 focus:outline-none focus:border-[#1E3A24] focus:ring-2 focus:ring-[#1E3A24]/10 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E3A24] mb-1.5">
              Senha de acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAF7F0]/40 border border-[#CBD8CB] text-[#1E3A24] text-sm placeholder-slate-400 focus:outline-none focus:border-[#1E3A24] focus:ring-2 focus:ring-[#1E3A24]/10 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#1E3A24] hover:bg-[#2A4E32] disabled:opacity-50 text-[#FAF7F0] font-bold text-sm shadow-lg shadow-[#1E3A24]/20 transition transform active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <span>Entrar no Painel</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </>
            )}
          </button>
        </form>

        {/* Atalho de Credenciais de Demonstração */}
        <div className="mt-8 pt-6 border-t border-[#EAE3D2] text-xs">
          <span className="text-[#5C665D] font-semibold block mb-2">
            Perfis de Demonstração (Seed inicial):
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fillQuickCredentials('admin@loja.com', 'Admin@Seguro123')}
              className="px-2.5 py-1.5 rounded-lg bg-[#FAF7F0] hover:bg-[#F5EEDC] text-[#1E3A24] text-[11px] font-mono border border-[#CBD8CB] transition"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials('gerente@loja.com', 'Gerente@123')}
              className="px-2.5 py-1.5 rounded-lg bg-[#FAF7F0] hover:bg-[#F5EEDC] text-[#1E3A24] text-[11px] font-mono border border-[#CBD8CB] transition"
            >
              Gerente
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials('atendente@loja.com', 'Atendente@123')}
              className="px-2.5 py-1.5 rounded-lg bg-[#FAF7F0] hover:bg-[#F5EEDC] text-[#1E3A24] text-[11px] font-mono border border-[#CBD8CB] transition"
            >
              Atendente
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-[#7D877E] hover:text-[#1E3A24] transition font-medium"
          >
            Voltar para a área de clientes
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1E3A24]" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
