'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Star,
  RefreshCw,
  FileSpreadsheet,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function RelatoriosPage() {
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState('30dias');
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const fetchReports = () => {
    setLoading(true);
    fetch(`/api/admin/relatorios?period=${period}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, [period]);

  const handleExportCsv = (type: 'reviews' | 'complaints') => {
    setIsExporting(true);
    window.location.href = `/api/admin/relatorios/export?type=${type}`;
    setTimeout(() => setIsExporting(false), 2000);
  };

  const summary = data?.summary || {};
  const hourly = data?.hourlyDistribution || [];
  const topTables = data?.topTablesWithComplaints || [];
  const categories = data?.categoryDistribution || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E3A24] tracking-tight">
            Relatórios & Indicadores de Desempenho
          </h1>
          <p className="text-xs sm:text-sm text-[#5C665D] mt-1">
            Análise consolidada de métricas, horários de pico e exportação segura de dados da Gelato Borelli
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Período */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-[#CBD8CB] bg-white text-xs font-semibold text-[#1E3A24] outline-none shadow-sm"
          >
            <option value="7dias">Últimos 7 dias</option>
            <option value="30dias">Últimos 30 dias</option>
            <option value="90dias">Últimos 90 dias</option>
            <option value="tudo">Histórico Completo</option>
          </select>

          {/* Exportação CSV com Proteção contra Fórmulas */}
          <div className="inline-flex rounded-xl shadow-sm">
            <button
              onClick={() => handleExportCsv('reviews')}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-l-xl bg-[#1E3A24] hover:bg-[#2A4E32] text-[#FAF7F0] text-xs font-bold transition"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>Exportar Avaliações</span>
            </button>
            <button
              onClick={() => handleExportCsv('complaints')}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-r-xl border-l border-[#2C4C2F] bg-[#1E3A24] hover:bg-[#2A4E32] text-[#FAF7F0] text-xs font-bold transition"
            >
              <span>Exportar Reclamações</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#EAE3D2] shadow-sm">
          <span className="text-xs font-semibold text-[#7D877E] block mb-1">Total de Avaliações</span>
          <span className="text-2xl font-bold text-[#1E3A24]">{summary.totalReviews || 0}</span>
          <span className="text-xs text-[#5C665D] block mt-1">no período selecionado</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#EAE3D2] shadow-sm">
          <span className="text-xs font-semibold text-[#7D877E] block mb-1">Nota Média</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#1E3A24]">{summary.averageRating || '0.0'}</span>
            <span className="text-amber-500 text-xs font-bold">★</span>
          </div>
          <span className="text-xs text-emerald-700 font-semibold block mt-1">
            {summary.positivePercentage || 0}% positivas
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#EAE3D2] shadow-sm">
          <span className="text-xs font-semibold text-[#7D877E] block mb-1">Total de Reclamações</span>
          <span className="text-2xl font-bold text-[#1E3A24]">{summary.totalComplaints || 0}</span>
          <span className="text-xs text-[#5C665D] block mt-1">
            {summary.negativePercentage || 0}% de insatisfação
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#EAE3D2] shadow-sm">
          <span className="text-xs font-semibold text-[#7D877E] block mb-1">Tempo Médio de Resolução</span>
          <span className="text-2xl font-bold text-[#1E3A24]">{summary.avgResolutionTimeHours || '0'}h</span>
          <span className="text-xs text-[#5C665D] block mt-1">do registro até resolução</span>
        </div>
      </div>

      {/* Gráficos Detalhados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horários com Maior Volume de Avaliações */}
        <div className="p-6 bg-white rounded-2xl border border-[#EAE3D2] shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#1E3A24]">Volume por Horário do Dia</h2>
            <p className="text-xs text-[#5C665D]">Picos de atendimento e movimentação no salão</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE3D2" />
                <XAxis dataKey="hour" stroke="#7D877E" fontSize={10} tickLine={false} interval={2} />
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
                <Bar dataKey="quantidade" name="Avaliações" fill="#1E3A24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mesas com Maior Quantidade de Reclamações */}
        <div className="p-6 bg-white rounded-2xl border border-[#EAE3D2] shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#1E3A24]">Mesas com Mais Ocorrências</h2>
            <p className="text-xs text-[#5C665D]">Identificação de pontos críticos no salão</p>
          </div>

          <div className="space-y-3 pt-2">
            {topTables.length > 0 ? (
              topTables.map((t: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-[#FAF7F0] rounded-xl border border-[#EAE3D2] text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#E4EBE4] text-[#1E3A24] flex items-center justify-center font-bold text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-[#1E3A24]">{t.tableName}</span>
                  </div>
                  <span className="font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                    {t.complaintsCount} ocorrências
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-[#7D877E] p-8 text-center">
                Nenhuma ocorrência registrada para as mesas no período.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Explicação e Transparência no Cálculo das Métricas */}
      <div className="p-5 bg-white border border-[#EAE3D2] rounded-2xl text-xs text-[#5C665D] space-y-2">
        <h3 className="font-bold text-[#1E3A24] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#3F643E]" />
          Como nossas métricas são calculadas:
        </h3>
        <ul className="list-disc pl-5 space-y-1 text-[#5C665D]">
          <li><strong>Nota Média:</strong> Média aritmética de todas as estrelas (1 a 5) salvas no banco de dados.</li>
          <li><strong>Avaliações Positivas:</strong> Percentual de avaliações com nota 4 ou 5 estrelas.</li>
          <li><strong>Tempo Médio de Resolução:</strong> Intervalo entre o registro da reclamação e o momento da alteração de status para &quot;RESOLVIDA&quot;.</li>
          <li><strong>Exportação Segura:</strong> Tratamento contra fórmulas de planilhas eletrônicas (=, +, -, @) garantindo integridade contra CSV Injection (CWE-1236).</li>
        </ul>
      </div>
    </div>
  );
}
