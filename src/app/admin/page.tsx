'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Star,
  MessageSquareWarning,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  RefreshCw,
  Utensils,
  ChevronRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#1E3A24', '#3F643E', '#CE2B37', '#D97706', '#0284C7', '#854D0E'];

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    setLoading(true);
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3 text-[#5C665D]">
          <RefreshCw className="w-8 h-8 animate-spin text-[#1E3A24]" />
          <span className="text-sm font-medium">Carregando indicadores reais da Gelato Borelli...</span>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const recentReviews = data?.recentReviews || [];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header com Atualizar e Título */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E3A24] tracking-tight">
            Painel Geral de Avaliações
          </h1>
          <p className="text-xs sm:text-sm text-[#5C665D] mt-1">
            Indicadores de qualidade artesanal, satisfação dos clientes e ouvidoria em tempo real
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#CBD8CB] text-xs font-semibold text-[#1E3A24] hover:bg-[#FAF7F0] shadow-sm transition active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#1E3A24]" />
            <span>Atualizar Dados</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total de Avaliações */}
        <div className="p-5 bg-white rounded-2xl border border-[#EAE3D2] shadow-sm">
          <div className="flex items-center justify-between text-[#5C665D] mb-2">
            <span className="text-xs font-semibold">Total de Avaliações</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#1E3A24] border border-[#CBD8CB] flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1E3A24]">{kpis.totalReviews || 0}</div>
          <div className="mt-2 text-xs text-[#5C665D] flex items-center gap-1">
            <span className="font-semibold text-[#1E3A24]">{kpis.reviewsToday || 0}</span> recebidas hoje
          </div>
        </div>

        {/* Nota Média */}
        <div className="p-5 bg-white rounded-2xl border border-[#EAE3D2] shadow-sm">
          <div className="flex items-center justify-between text-[#5C665D] mb-2">
            <span className="text-xs font-semibold">Nota Média</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1E3A24]">{kpis.averageRating || '0.0'}</span>
            <span className="text-xs text-[#7D877E]">/ 5.0</span>
          </div>
          <div className="mt-2 text-xs text-[#5C665D] flex items-center gap-1">
            <span className="text-emerald-700 font-semibold">{kpis.positivePercentage || 0}%</span> positivas
          </div>
        </div>

        {/* Reclamações Novas */}
        <div className="p-5 bg-white rounded-2xl border border-[#EAE3D2] shadow-sm">
          <div className="flex items-center justify-between text-[#5C665D] mb-2">
            <span className="text-xs font-semibold">Reclamações Novas</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              (kpis.newComplaintsCount || 0) > 0 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-[#FAF7F0] text-[#5C665D]'
            }`}>
              <MessageSquareWarning className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1E3A24]">{kpis.newComplaintsCount || 0}</div>
          <div className="mt-2 text-xs text-[#5C665D] flex items-center gap-1">
            <span className="text-amber-700 font-semibold">{kpis.inProgressComplaintsCount || 0}</span> em atendimento
          </div>
        </div>

        {/* Resolvidas & SLA */}
        <div className="p-5 bg-white rounded-2xl border border-[#EAE3D2] shadow-sm">
          <div className="flex items-center justify-between text-[#5C665D] mb-2">
            <span className="text-xs font-semibold">Taxa de Resolução</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1E3A24]">{kpis.resolutionRate || 0}%</div>
          <div className="mt-2 text-xs text-[#5C665D] flex items-center gap-1">
            {kpis.overdueComplaintsCount > 0 ? (
              <span className="text-rose-600 font-semibold">{kpis.overdueComplaintsCount} fora do prazo</span>
            ) : (
              <span className="text-emerald-700 font-medium">Nenhuma atrasada</span>
            )}
          </div>
        </div>
      </div>

      {/* Gráficos Reais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Evolução dos Últimos 7 Dias */}
        <div className="p-6 bg-white rounded-2xl border border-[#EAE3D2] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#1E3A24]">Evolução Diária (Últimos 7 dias)</h2>
              <p className="text-xs text-[#5C665D]">Volume de feedbacks e ocorrências registradas</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.last7Days || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE3D2" />
                <XAxis dataKey="date" stroke="#7D877E" fontSize={11} tickLine={false} />
                <YAxis stroke="#7D877E" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E3A24',
                    border: '1px solid #2C4C2F',
                    borderRadius: '12px',
                    color: '#FAF7F0',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="reviews"
                  name="Avaliações"
                  stroke="#1E3A24"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#1E3A24' }}
                />
                <Line
                  type="monotone"
                  dataKey="complaints"
                  name="Reclamações"
                  stroke="#CE2B37"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#CE2B37' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Distribuição das Notas (Estrelas) */}
        <div className="p-6 bg-white rounded-2xl border border-[#EAE3D2] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#1E3A24]">Distribuição das Notas</h2>
              <p className="text-xs text-[#5C665D]">Frequência de estrelas de 1 a 5 atribuídas</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.ratingDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE3D2" />
                <XAxis dataKey="star" stroke="#7D877E" fontSize={11} tickLine={false} />
                <YAxis stroke="#7D877E" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E3A24',
                    border: '1px solid #2C4C2F',
                    borderRadius: '12px',
                    color: '#FAF7F0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="quantidade" name="Avaliações" fill="#D97706" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 3: Reclamações por Categoria */}
        <div className="p-6 bg-white rounded-2xl border border-[#EAE3D2] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#1E3A24]">Reclamações por Categoria</h2>
              <p className="text-xs text-[#5C665D]">Classificação dos motivos apontados pelos clientes</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {charts.complaintsByCategory && charts.complaintsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={charts.complaintsByCategory}
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EAE3D2" />
                  <XAxis type="number" stroke="#7D877E" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="category" stroke="#7D877E" fontSize={10} width={90} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E3A24',
                      border: '1px solid #2C4C2F',
                      borderRadius: '12px',
                      color: '#FAF7F0',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="total" name="Reclamações" fill="#CE2B37" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#7D877E]">
                Nenhuma reclamação registrada até o momento.
              </div>
            )}
          </div>
        </div>

        {/* Gráfico 4: Status das Reclamações (Pizza) */}
        <div className="p-6 bg-white rounded-2xl border border-[#EAE3D2] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#1E3A24]">Status das Reclamações</h2>
              <p className="text-xs text-[#5C665D]">Proporção do andamento do suporte</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {charts.complaintsByStatus && charts.complaintsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.complaintsByStatus}
                    dataKey="total"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {charts.complaintsByStatus.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E3A24',
                      border: '1px solid #2C4C2F',
                      borderRadius: '12px',
                      color: '#FAF7F0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#7D877E]">
                Sem ocorrências pendentes no momento.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabela de Avaliações Recentes */}
      <div className="bg-white rounded-2xl border border-[#EAE3D2] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#EAE3D2] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#1E3A24]">Avaliações Mais Recentes</h2>
            <p className="text-xs text-[#5C665D]">Últimos feedbacks recebidos em mesas ou geral</p>
          </div>
          <Link
            href="/admin/avaliacoes"
            className="text-xs font-semibold text-[#1E3A24] hover:text-[#2E5436] inline-flex items-center gap-1"
          >
            <span>Ver todas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead className="bg-[#FAF7F0] text-[#1E3A24] border-b border-[#EAE3D2] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Protocolo</th>
                <th className="py-3 px-4">Data/Hora</th>
                <th className="py-3 px-4">Mesa</th>
                <th className="py-3 px-4">Nota</th>
                <th className="py-3 px-4">Comentário</th>
                <th className="py-3 px-4">Reclamação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D2]/70">
              {recentReviews.map((rev: any) => (
                <tr key={rev.id} className="hover:bg-[#FAF7F0]/60 transition">
                  <td className="py-3 px-4 font-mono font-semibold text-[#1E3A24]">
                    {rev.protocol}
                  </td>
                  <td className="py-3 px-4 text-[#5C665D]">
                    {new Date(rev.createdAt).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 font-medium text-[#1E3A24]">
                    {rev.table ? `Mesa ${rev.table.number}` : 'Geral'}
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
                            : rev.complaint.status === 'EM_ATENDIMENTO'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        <span>{rev.complaint.status}</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
