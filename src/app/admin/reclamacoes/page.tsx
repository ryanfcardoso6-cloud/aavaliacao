'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MessageSquareWarning,
  Search,
  Filter,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const STATUS_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  NOVA: { bg: 'bg-rose-100 border-rose-200', text: 'text-rose-700', label: 'Nova' },
  EM_ATENDIMENTO: { bg: 'bg-amber-100 border-amber-200', text: 'text-amber-800', label: 'Em Atendimento' },
  AGUARDANDO_RETORNO: { bg: 'bg-blue-100 border-blue-200', text: 'text-blue-800', label: 'Aguardando Cliente' },
  RESOLVIDA: { bg: 'bg-emerald-100 border-emerald-200', text: 'text-emerald-800', label: 'Resolvida' },
  ARQUIVADA: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600', label: 'Arquivada' },
};

export default function ReclamacoesPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filtros
  const [status, setStatus] = useState('TODOS');
  const [category, setCategory] = useState('TODOS');
  const [search, setSearch] = useState('');

  const fetchComplaints = (pageToLoad = 1) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(pageToLoad),
      limit: '15',
    });

    if (status !== 'TODOS') params.set('status', status);
    if (category !== 'TODOS') params.set('category', category);
    if (search.trim()) params.set('search', search.trim());

    fetch(`/api/admin/reclamacoes?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setComplaints(data.complaints || []);
        if (data.pagination) setPagination(data.pagination);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchComplaints(1);
  }, [status, category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaints(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E3A24] tracking-tight">
            Gestão de Reclamações & Ouvidoria
          </h1>
          <p className="text-xs sm:text-sm text-[#5C665D] mt-1">
            Acompanhamento de ocorrências, tratativas, prazos e histórico de soluções da Gelato Borelli
          </p>
        </div>

        <button
          onClick={() => fetchComplaints(pagination.page)}
          className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#CBD8CB] text-xs font-semibold text-[#1E3A24] hover:bg-[#FAF7F0] shadow-sm transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#1E3A24]" />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="p-4 bg-white rounded-2xl border border-[#EAE3D2] shadow-sm space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por protocolo, nome do cliente ou palavras da descrição..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF7F0]/40 border border-[#CBD8CB] text-xs sm:text-sm text-[#1E3A24] placeholder-slate-400 focus:outline-none focus:border-[#1E3A24]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-[#1E3A24] hover:bg-[#2A4E32] text-[#FAF7F0] rounded-xl text-xs font-bold transition shadow-sm"
          >
            Buscar
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-1">
          {/* Status Tabs */}
          {[
            { id: 'TODOS', label: 'Todos os Status' },
            { id: 'NOVA', label: 'Novas' },
            { id: 'EM_ATENDIMENTO', label: 'Em Atendimento' },
            { id: 'AGUARDANDO_RETORNO', label: 'Aguardando Retorno' },
            { id: 'RESOLVIDA', label: 'Resolvidas' },
            { id: 'ARQUIVADA', label: 'Arquivadas' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatus(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                status === st.id
                  ? 'bg-[#1E3A24] text-white border-[#1E3A24] shadow-sm'
                  : 'bg-white text-[#5C665D] border-[#CBD8CB] hover:bg-[#FAF7F0]'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Reclamações */}
      <div className="bg-white rounded-2xl border border-[#EAE3D2] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-[#FAF7F0] text-[#1E3A24] border-b border-[#EAE3D2] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Protocolo</th>
                <th className="py-3 px-4">Mesa</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Descrição do Ocorrido</th>
                <th className="py-3 px-4">Cliente / Contato</th>
                <th className="py-3 px-4">Responsável</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-600" />
                    Carregando reclamações...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Nenhuma reclamação encontrada nesta listagem.
                  </td>
                </tr>
              ) : (
                complaints.map((comp) => {
                  const badge = STATUS_BADGES[comp.status] || {
                    bg: 'bg-slate-100',
                    text: 'text-slate-600',
                    label: comp.status,
                  };
                  return (
                    <tr key={comp.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text}`}
                        >
                          {comp.status === 'NOVA' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                          )}
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#1E3A24]">
                        {comp.protocol}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#1E3A24]">
                        {comp.review?.table ? `Mesa ${comp.review.table.number}` : 'Balcão / Geral'}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#1E3A24]">
                        {comp.category}
                      </td>
                      <td className="py-3 px-4 text-[#5C665D] max-w-xs truncate">
                        {comp.description}
                      </td>
                      <td className="py-3 px-4">
                        {comp.customerName || comp.customerPhone || comp.customerEmail ? (
                          <div className="space-y-0.5">
                            <div className="font-semibold text-[#1E3A24]">
                              {comp.customerName || 'Cliente'}
                            </div>
                            <div className="text-[11px] text-[#7D877E] flex items-center gap-2">
                              {comp.customerPhone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-[#3F643E]" />
                                  {comp.customerPhone}
                                </span>
                              )}
                              {comp.customerEmail && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-[#3F643E]" />
                                  {comp.customerEmail}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Anônimo</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {comp.assignedTo ? (
                          <span className="inline-flex items-center gap-1 text-[#1E3A24] font-medium">
                            <UserCheck className="w-3.5 h-3.5 text-[#3F643E]" />
                            {comp.assignedTo.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Não atribuído</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#5C665D]">
                        {new Date(comp.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/reclamacoes/${comp.id}`}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#1E3A24] hover:bg-[#2A4E32] text-[#FAF7F0] font-bold text-[11px] shadow-sm transition active:scale-95"
                        >
                          <span>Atender</span>
                          <ArrowRight className="w-3 h-3 text-amber-300" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Paginação */}
        <div className="p-4 bg-[#FAF7F0] border-t border-[#EAE3D2] flex items-center justify-between text-xs text-[#5C665D]">
          <div>
            Total de <strong>{pagination.total}</strong> reclamações
          </div>

          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchComplaints(pagination.page - 1)}
              className="p-1.5 rounded-lg border border-[#CBD8CB] bg-white hover:bg-[#FAF7F0] disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4 text-[#1E3A24]" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchComplaints(pagination.page + 1)}
              className="p-1.5 rounded-lg border border-[#CBD8CB] bg-white hover:bg-[#FAF7F0] disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4 text-[#1E3A24]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
