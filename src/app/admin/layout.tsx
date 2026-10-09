'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Star,
  MessageSquareWarning,
  QrCode,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Utensils,
  Shield,
  Bell,
  UserCheck,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Ignora layout completo na página de login
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(async (res) => {
        if (!res.ok) {
          router.push('/admin/login');
          return;
        }
        const data = await res.json();
        setUser(data.user);
      })
      .catch(() => {
        router.push('/admin/login');
      });

    // Atualiza contagem de novos alertas
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.kpis) {
          setUnreadCount(data.kpis.newComplaintsCount || 0);
        }
      })
      .catch(() => {});
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  const navItems = [
    { label: 'Visão Geral', href: '/admin', icon: LayoutDashboard },
    { label: 'Avaliações', href: '/admin/avaliacoes', icon: Star },
    {
      label: 'Reclamações',
      href: '/admin/reclamacoes',
      icon: MessageSquareWarning,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    { label: 'Mesas e QR Codes', href: '/admin/mesas', icon: QrCode },
    { label: 'Relatórios', href: '/admin/relatorios', icon: BarChart3 },
    ...(user?.role === 'ADMIN'
      ? [
          { label: 'Usuários', href: '/admin/usuarios', icon: Users },
          { label: 'Configurações', href: '/admin/configuracoes', icon: Settings },
        ]
      : []),
  ];

  const roleLabel =
    user?.role === 'ADMIN'
      ? 'Administrador'
      : user?.role === 'MANAGER'
      ? 'Gerente'
      : 'Atendente';

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#1E3A24] flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="no-print hidden md:flex flex-col w-64 bg-[#1E3A24] text-[#FAF7F0] border-r border-[#2C4C2F] shrink-0 select-none">
        {/* Brand Gelato Borelli */}
        <div className="p-5 border-b border-[#2C4C2F] flex items-center gap-3">
          <div className="p-1.5 bg-[#FAF7F0] rounded-xl border border-white/20 shrink-0 shadow-sm">
            <img
              src="/logo-borelli.png"
              alt="Gelato Borelli"
              className="h-9 w-auto object-contain"
            />
          </div>
          <div>
            <span className="text-white font-extrabold text-sm tracking-tight block">
              Gelato Borelli
            </span>
            <span className="text-[10px] text-[#A3BE9E] block font-medium">
              Painel de Gestão & Ouvidoria
            </span>
          </div>
        </div>

        {/* Faixa Tricolor Italiana */}
        <div className="h-1 flex w-full">
          <div className="w-1/3 bg-[#009246]" />
          <div className="w-1/3 bg-[#FFFFFF]" />
          <div className="w-1/3 bg-[#CE2B37]" />
        </div>

        {/* Navegação */}
        <nav className="p-3.5 space-y-1.5 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#2E5436] text-white shadow-md ring-1 ring-[#FAF7F0]/25'
                    : 'text-[#D1DEC8] hover:text-white hover:bg-[#25422B]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-[#A3BE9E]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#CE2B37] text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Perfil & Logout */}
        <div className="p-4 border-t border-[#2C4C2F] bg-[#142618]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#2E5436] border border-[#3E6E48] flex items-center justify-center text-xs font-bold text-[#FAF7F0]">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-[#FAF7F0] block truncate">
                  {user?.name || 'Carregando...'}
                </span>
                <span className="text-[10px] text-[#A3BE9E] block font-medium">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-[#D1DEC8] hover:text-rose-200 hover:bg-rose-900/40 border border-transparent hover:border-rose-800 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Top Header Mobile */}
      <header className="no-print md:hidden bg-[#1E3A24] text-white p-3.5 flex items-center justify-between border-b border-[#2C4C2F] sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="p-1 bg-[#FAF7F0] rounded-lg">
            <img
              src="/logo-borelli.png"
              alt="Gelato Borelli"
              className="h-6 w-auto object-contain"
            />
          </div>
          <span className="font-bold text-sm tracking-tight text-[#FAF7F0]">Gelato Borelli Gestão</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-[#FAF7F0] hover:bg-[#25422B] transition"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Drawer Mobile */}
      {mobileMenuOpen && (
        <div className="no-print md:hidden bg-[#1E3A24] text-[#FAF7F0] p-4 border-b border-[#2C4C2F] space-y-1.5 shadow-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                  isActive ? 'bg-[#2E5436] text-white shadow-sm' : 'hover:bg-[#25422B] text-[#D1DEC8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-[#A3BE9E]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#CE2B37] text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-[#2C4C2F] flex items-center justify-between">
            <div className="text-xs text-[#A3BE9E]">
              {user?.name} ({roleLabel})
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-rose-300 hover:bg-rose-950/40"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FAF7F0] overflow-y-auto">
        <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
