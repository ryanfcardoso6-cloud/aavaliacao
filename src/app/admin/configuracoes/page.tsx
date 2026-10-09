'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  Save,
  Loader2,
  Check,
  AlertCircle,
  Building,
  Clock,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
} from 'lucide-react';

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<any>({
    storeName: '',
    logoUrl: '',
    description: '',
    welcomeMessage: '',
    subtitleMessage: '',
    thankYouPositive: '',
    thankYouNegative: '',
    slaHours: 24,
    phone: '',
    email: '',
    address: '',
    businessHours: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/configuracoes')
      .then((res) => res.json())
      .then((d) => {
        if (d.config) setConfig(d.config);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/configuracoes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const d = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'error', message: d.error || 'Erro ao salvar alterações' });
      } else {
        setFeedback({ type: 'success', message: 'Configurações atualizadas com sucesso!' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Erro de conexão com o servidor' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A24]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#1E3A24] tracking-tight">
          Configurações do Estabelecimento
        </h1>
        <p className="text-xs sm:text-sm text-[#5C665D] mt-1">
          Identidade visual, mensagens públicas aos clientes, prazos de atendimento (SLA) e contatos
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identidade da Loja */}
        <div className="bg-white rounded-2xl border border-[#EAE3D2] p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#1E3A24] flex items-center gap-2 border-b border-[#EAE3D2] pb-3">
            <Building className="w-4 h-4 text-[#3F643E]" />
            <span>Identidade do Estabelecimento</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1E3A24] mb-1">Nome da Loja:</label>
              <input
                type="text"
                required
                value={config.storeName || ''}
                onChange={(e) => setConfig({ ...config, storeName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD8CB] text-sm font-semibold text-[#1E3A24] outline-none focus:border-[#1E3A24] focus:ring-1 focus:ring-[#1E3A24]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1E3A24] mb-1">URL da Logo (Opcional):</label>
              <input
                type="text"
                value={config.logoUrl || ''}
                onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                placeholder="https://sua-loja.com/logo.png"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD8CB] text-sm text-[#1E3A24] outline-none focus:border-[#1E3A24] focus:ring-1 focus:ring-[#1E3A24]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#1E3A24] mb-1">Slogan / Descrição Curta:</label>
              <input
                type="text"
                value={config.description || ''}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD8CB] text-sm text-[#1E3A24] outline-none focus:border-[#1E3A24] focus:ring-1 focus:ring-[#1E3A24]"
              />
            </div>
          </div>
        </div>

        {/* Mensagens da Área Pública */}
        <div className="bg-white rounded-2xl border border-[#EAE3D2] p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#1E3A24] flex items-center gap-2 border-b border-[#EAE3D2] pb-3">
            <MessageSquare className="w-4 h-4 text-[#3F643E]" />
            <span>Mensagens Exibidas aos Clientes</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1E3A24] mb-1">Pergunta Inicial (Cabeçalho):</label>
              <input
                type="text"
                required
                value={config.welcomeMessage || ''}
                onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD8CB] text-sm text-[#1E3A24] outline-none focus:border-[#1E3A24] focus:ring-1 focus:ring-[#1E3A24]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1E3A24] mb-1">Subtítulo Explicativo:</label>
              <input
                type="text"
                required
                value={config.subtitleMessage || ''}
                onChange={(e) => setConfig({ ...config, subtitleMessage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD8CB] text-sm text-[#1E3A24] outline-none focus:border-[#1E3A24] focus:ring-1 focus:ring-[#1E3A24]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1E3A24] mb-1">
                Agradecimento para Avaliações Positivas (4 e 5 estrelas):
              </label>
              <textarea
                rows={2}
                required
                value={config.thankYouPositive || ''}
                onChange={(e) => setConfig({ ...config, thankYouPositive: e.target.value })}
                className="w-full p-3 rounded-xl border border-[#CBD8CB] text-xs text-[#1E3A24] outline-none focus:border-[#1E3A24] focus:ring-1 focus:ring-[#1E3A24]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1E3A24] mb-1">
                Mensagem para Avaliações com Reclamações (1 a 3 estrelas):
              </label>
              <textarea
                rows={2}
                required
                value={config.thankYouNegative || ''}
                onChange={(e) => setConfig({ ...config, thankYouNegative: e.target.value })}
                className="w-full p-3 rounded-xl border border-[#CBD8CB] text-xs text-[#1E3A24] outline-none focus:border-[#1E3A24] focus:ring-1 focus:ring-[#1E3A24]"
              />
            </div>
          </div>
        </div>

        {/* Prazos de SLA e Atendimento */}
        <div className="bg-white rounded-2xl border border-[#EAE3D2] p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#1E3A24] flex items-center gap-2 border-b border-[#EAE3D2] pb-3">
            <Clock className="w-4 h-4 text-[#3F643E]" />
            <span>Prazo de Atendimento de Reclamações (SLA)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1E3A24] mb-1">Prazo Limite para Solução (Horas):</label>
              <input
                type="number"
                min={1}
                max={720}
                required
                value={config.slaHours || 24}
                onChange={(e) => setConfig({ ...config, slaHours: parseInt(e.target.value) || 24 })}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD8CB] text-sm font-bold text-[#1E3A24] outline-none focus:border-[#1E3A24] focus:ring-1 focus:ring-[#1E3A24]"
              />
              <span className="text-[11px] text-[#5C665D] mt-1 block">
                Reclamações abertas há mais de {config.slaHours}h serão sinalizadas como &quot;Atrasadas&quot; no painel.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-[#1E3A24] mb-1">Horário de Funcionamento:</label>
              <input
                type="text"
                value={config.businessHours || ''}
                onChange={(e) => setConfig({ ...config, businessHours: e.target.value })}
                placeholder="Ex: Terça a Domingo das 11h30 às 23h30"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD8CB] text-sm text-[#1E3A24] outline-none focus:border-[#1E3A24] focus:ring-1 focus:ring-[#1E3A24]"
              />
            </div>
          </div>
        </div>

        {/* Informações Institucionais e LGPD */}
        <div className="bg-white rounded-2xl border border-[#EAE3D2] p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#1E3A24] flex items-center gap-2 border-b border-[#EAE3D2] pb-3">
            <ShieldCheck className="w-4 h-4 text-[#3F643E]" />
            <span>Contatos Institucionais (Exibidos na Política de Privacidade)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1E3A24] mb-1">Telefone / WhatsApp da Loja:</label>
              <input
                type="text"
                value={config.phone || ''}
                onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD8CB] text-sm text-[#1E3A24] outline-none focus:border-[#1E3A24] focus:ring-1 focus:ring-[#1E3A24]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1E3A24] mb-1">E-mail de Ouvidoria / DPO:</label>
              <input
                type="email"
                value={config.email || ''}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD8CB] text-sm text-[#1E3A24] outline-none focus:border-[#1E3A24] focus:ring-1 focus:ring-[#1E3A24]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#1E3A24] mb-1">Endereço Físico do Estabelecimento:</label>
              <input
                type="text"
                value={config.address || ''}
                onChange={(e) => setConfig({ ...config, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD8CB] text-sm text-[#1E3A24] outline-none focus:border-[#1E3A24] focus:ring-1 focus:ring-[#1E3A24]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#1E3A24] hover:bg-[#2A4E32] text-[#FAF7F0] font-bold text-sm shadow-md shadow-[#1E3A24]/20 transition"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Salvar Configurações</span>
          </button>
        </div>
      </form>
    </div>
  );
}
