'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Star,
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  MessageSquareWarning,
  CheckCircle2,
  Calendar,
  X,
  RefreshCw,
} from 'lucide-react';

export default function AvaliacoesPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [rating, setRating] = useState('');
  const [tableId, setTableId] = useState('');
  const [period, setPeriod] = useState('');
  const [hasComment, setHasComment] = useState('');
  const [hasComplaint, setHasComplaint] = useState('');

  // Modal de Detalhes
  const [selectedReview, setSelectedReview] = useState<any | null>(null);

  const fetchTables = () => {
    fetch('/api/admin/mesas')
      .then((res) => res.json())
      .then((d) => setTables(d.tables || []))
      .catch(() => {});
  };

  const fetchReviews = (pageToLoad = 1) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(pageToLoad),
      limit: '15',
    });

    if (search) params.set('search', search);
    if (rating) params.set('rating', rating);
    if (tableId) params.set('tableId', tableId);
    if (period) params.set('period', period);
    if (hasComment) params.set('hasComment', hasComment);
    if (hasComplaint) params.set('hasComplaint', hasComplaint);

    fetch(`/api/admin/avaliacoes?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
        if (data.pagination) setPagination(data.pagination);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    fetchReviews(1);
  }, [rating, tableId, period, hasComment, hasComplaint]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReviews(1);
  };

  const handleOpenDetail = (rev: any) => {
    setSelectedReview(rev);
    // Se não visualizado, marca no servidor
    if (!rev.viewedByStaff) {
      fetch(`/api/admin/avaliacoes?id=${rev.id}`, { method: 'PATCH' }).then(() => {
        setReviews((prev) =>
          prev.map((item) => (item.id === rev.id ? { ...item, viewedByStaff: true } : item))
        );
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E3A24] tracking-tight">
            Gestão de Avaliações
          </h1>
          <p className="text-xs sm:text-sm text-[#5C665D] mt-1">
            Consulta, filtros avançados e paginação no servidor
          </p>
        </div>

        <button
          onClick={() => fetchReviews(pagination.page)}
          className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#CBD8CB] text-xs font-semibold text-[#1E3A24] hover:bg-[#FAF7F0] shadow-sm transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#1E3A24]" />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="p-4 bg-white rounded-2xl border border-[#EAE3D2] shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por protocolo ou palavras no comentário..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF7F0]/40 border border-[#CBD8CB] text-xs sm:text-sm text-[#1E3A24] placeholder-slate-400 focus:outline-none focus:border-[#1E3A24] focus:ring-1 focus:ring-[#1E3A24]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-[#1E3A24] hover:bg-[#2A4E32] text-[#FAF7F0] rounded-xl text-xs font-bold transition shadow-sm"
          >
            Buscar
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {/* Período */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#CBD8CB] bg-white text-xs text-[#1E3A24] focus:outline-none focus:border-[#1E3A24]"
          >
            <option value="">Todo o período</option>
            <option value="hoje">Recebidas hoje</option>
            <option value="7dias">Últimos 7 dias</option>
            <option value="30dias">Últimos 30 dias</option>
          </select>

          {/* Nota */}
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#CBD8CB] bg-white text-xs text-[#1E3A24] focus:outline-none focus:border-[#1E3A24]"
          >
            <option value="">Todas as notas</option>
            <option value="5">5 estrelas ★★★★★</option>
            <option value="4">4 estrelas ★★★★</option>
            <option value="3">3 estrelas ★★★</option>
            <option value="2">2 estrelas ★★</option>
            <option value="1">1 estrela ★</option>
          </select>

          {/* Mesa */}
          <select
            value={tableId}
            onChange={(e) => setTableId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#CBD8CB] bg-white text-xs text-[#1E3A24] focus:outline-none focus:border-[#1E3A24]"
          >
            <option value="">Todas as mesas</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                Mesa {t.number} - {t.name}
              </option>
            ))}
          </select>

          {/* Comentário */}
          <select
            value={hasComment}
            onChange={(e) => setHasComment(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#CBD8CB] bg-white text-xs text-[#1E3A24] focus:outline-none focus:border-[#1E3A24]"
          >
            <option value="">Com ou sem comentário</option>
            <option value="true">Apenas com comentário</option>
            <option value="false">Sem comentário</option>
          </select>

          {/* Reclamação */}
          <select
            value={hasComplaint}
            onChange={(e) => setHasComplaint(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#CBD8CB] bg-white text-xs text-[#1E3A24] focus:outline-none focus:border-[#1E3A24]"
          >
            <option value="">Com ou sem reclamação</option>
            <option value="true">Apenas com reclamação</option>
            <option value="false">Apenas elogios/normais</option>
          </select>
        </div>
      </div>

      {/* Tabela de Resultados */}
      <div className="bg-white rounded-2xl border border-[#EAE3D2] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-[#FAF7F0] text-[#1E3A24] border-b border-[#EAE3D2] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Status / Visto</th>
                <th className="py-3 px-4">Protocolo</th>
                <th className="py-3 px-4">Data e Hora</th>
                <th className="py-3 px-4">Mesa</th>
                <th className="py-3 px-4">Nota</th>
                <th className="py-3 px-4">Comentário</th>
                <th className="py-3 px-4">Reclamação</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D2]/70">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#5C665D]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1E3A24]" />
                    Carregando avaliações...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#7D877E]">
                    Nenhuma avaliação encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-[#FAF7F0]/60 transition">
                    <td className="py-3 px-4">
                      {rev.viewedByStaff ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#7D877E] font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#3F643E]" />
                          <span>Lido</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E4EBE4] text-[#1E3A24]">
                          Novo
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#1E3A24]">
                      {rev.protocol}
                    </td>
                    <td className="py-3 px-4 text-[#5C665D]">
                      {new Date(rev.createdAt).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#1E3A24]">
                      {rev.table ? `Mesa ${rev.table.number}` : 'Balcão / Geral'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-500">
                        {rev.rating} <Star className="w-3.5 h-3.5 fill-amber-500" />
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#5C665D] max-w-xs truncate">
                      {rev.comment || <span className="text-slate-400 italic">Sem comentário</span>}
                    </td>
                    <td className="py-3 px-4">
                      {rev.complaint ? (
                        <Link
                          href={`/admin/reclamacoes/${rev.complaint.id}`}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            rev.complaint.status === 'NOVA'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          <MessageSquareWarning className="w-3 h-3" />
                          <span>{rev.complaint.status}</span>
                        </Link>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(rev)}
                        className="p-1.5 rounded-lg text-[#5C665D] hover:text-[#1E3A24] hover:bg-[#FAF7F0] transition"
                        title="Ver Detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Paginação */}
        <div className="p-4 bg-[#FAF7F0] border-t border-[#EAE3D2] flex items-center justify-between text-xs text-[#5C665D]">
          <div>
            Total de <strong>{pagination.total}</strong> registros (Página{' '}
            <strong>{pagination.page}</strong> de <strong>{pagination.totalPages}</strong>)
          </div>

          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchReviews(pagination.page - 1)}
              className="p-1.5 rounded-lg border border-[#CBD8CB] bg-white hover:bg-[#FAF7F0] disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4 text-[#1E3A24]" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchReviews(pagination.page + 1)}
              className="p-1.5 rounded-lg border border-[#CBD8CB] bg-white hover:bg-[#FAF7F0] disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4 text-[#1E3A24]" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes da Avaliação */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#EAE3D2] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D2]">
              <h2 className="text-base font-bold text-[#1E3A24]">Detalhes da Avaliação</h2>
              <button
                onClick={() => setSelectedReview(null)}
                className="p-1.5 rounded-lg text-[#5C665D] hover:text-[#1E3A24] hover:bg-[#FAF7F0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-[#FAF7F0] rounded-xl border border-[#EAE3D2]">
                <div>
                  <span className="text-[#5C665D] block">Protocolo:</span>
                  <span className="font-mono font-bold text-[#1E3A24]">{selectedReview.protocol}</span>
                </div>
                <div>
                  <span className="text-[#5C665D] block">Mesa:</span>
                  <span className="font-bold text-[#1E3A24]">
                    {selectedReview.table ? `Mesa ${selectedReview.table.number} (${selectedReview.table.name})` : 'Geral'}
                  </span>
                </div>
                <div>
                  <span className="text-[#5C665D] block">Data/Hora:</span>
                  <span className="text-[#1E3A24]">
                    {new Date(selectedReview.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div>
                  <span className="text-[#5C665D] block">Nota:</span>
                  <span className="font-bold text-amber-500 flex items-center gap-1">
                    {selectedReview.rating} de 5 ★
                  </span>
                </div>
              </div>

              {selectedReview.comment && (
                <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#EAE3D2]">
                  <span className="text-[#5C665D] font-semibold block mb-1">Comentário do Cliente:</span>
                  <p className="text-[#1E3A24] leading-relaxed italic">
                    &ldquo;{selectedReview.comment}&rdquo;
                  </p>
                </div>
              )}

              {selectedReview.complaint && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-800 flex items-center gap-1.5">
                      <MessageSquareWarning className="w-4 h-4 text-rose-600" />
                      Reclamação Vinculada
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-800">
                      {selectedReview.complaint.status}
                    </span>
                  </div>
                  <div className="text-slate-700 text-xs">
                    <strong>Categoria:</strong> {selectedReview.complaint.category}
                  </div>
                  {selectedReview.complaint.customerName && (
                    <div className="text-slate-700 text-xs">
                      <strong>Cliente:</strong> {selectedReview.complaint.customerName}
                    </div>
                  )}
                  <div className="pt-2">
                    <Link
                      href={`/admin/reclamacoes/${selectedReview.complaint.id}`}
                      className="inline-flex items-center gap-1 px-3.5 py-2 bg-[#1E3A24] hover:bg-[#2A4E32] text-[#FAF7F0] font-bold rounded-xl text-xs transition"
                    >
                      <span>Abrir Atendimento Completo</span>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#EAE3D2] text-right">
              <button
                onClick={() => setSelectedReview(null)}
                className="px-4 py-2 bg-[#FAF7F0] hover:bg-[#F5EEDC] text-[#1E3A24] font-bold rounded-xl text-xs border border-[#CBD8CB] transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
