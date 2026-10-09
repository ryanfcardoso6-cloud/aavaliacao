'use client';

import React, { useEffect, useState } from 'react';
import {
  QrCode,
  Plus,
  Edit2,
  Power,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  X,
  AlertCircle,
  Loader2,
  Utensils,
} from 'lucide-react';

export default function MesasPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de Criação / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<any | null>(null);
  const [formNumber, setFormNumber] = useState<number>(1);
  const [formName, setFormName] = useState<string>('');
  const [formActive, setFormActive] = useState<boolean>(true);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal de Visualização de QR Code
  const [qrModalTable, setQrModalTable] = useState<any | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // Modo de Impressão em Lote
  const [batchPrintMode, setBatchPrintMode] = useState(false);
  const [batchQrCodes, setBatchQrCodes] = useState<Record<string, string>>({});

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchTables = () => {
    setLoading(true);
    fetch('/api/admin/mesas')
      .then((res) => res.json())
      .then((d) => {
        setTables(d.tables || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleOpenCreate = () => {
    setEditingTable(null);
    const nextNumber = tables.length > 0 ? Math.max(...tables.map((t) => t.number)) + 1 : 1;
    setFormNumber(nextNumber);
    setFormName(`Mesa ${String(nextNumber).padStart(2, '0')}`);
    setFormActive(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: any) => {
    setEditingTable(t);
    setFormNumber(t.number);
    setFormName(t.name);
    setFormActive(t.active);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setModalError(null);

    try {
      if (editingTable) {
        // Atualizar
        const res = await fetch(`/api/admin/mesas/${editingTable.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ number: formNumber, name: formName, active: formActive }),
        });
        const d = await res.json();
        if (!res.ok) {
          setModalError(d.error || 'Erro ao atualizar');
          setIsSaving(false);
          return;
        }
      } else {
        // Criar
        const res = await fetch('/api/admin/mesas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ number: formNumber, name: formName, active: formActive }),
        });
        const d = await res.json();
        if (!res.ok) {
          setModalError(d.error || 'Erro ao criar mesa');
          setIsSaving(false);
          return;
        }
      }

      setIsModalOpen(false);
      fetchTables();
    } catch {
      setModalError('Erro de conexão');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (table: any) => {
    try {
      await fetch(`/api/admin/mesas/${table.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !table.active }),
      });
      fetchTables();
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewQr = async (table: any) => {
    setQrModalTable(table);
    setQrCodeData(null);
    setQrCodeUrl(null);

    const res = await fetch(`/api/admin/mesas/${table.id}/qrcode`);
    const data = await res.json();
    if (res.ok) {
      setQrCodeData(data.qrCodeDataUrl);
      setQrCodeUrl(data.url);
    }
  };

  const handleCopyLink = (table: any) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/avaliar?mesa=${table.token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(table.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownloadPng = (table: any) => {
    window.location.href = `/api/admin/mesas/${table.id}/qrcode?format=png`;
  };

  const handleOpenBatchPrint = async () => {
    setBatchPrintMode(true);
    const codesMap: Record<string, string> = {};

    for (const t of tables.filter((item) => item.active)) {
      try {
        const res = await fetch(`/api/admin/mesas/${t.id}/qrcode`);
        const data = await res.json();
        if (data.qrCodeDataUrl) {
          codesMap[t.id] = data.qrCodeDataUrl;
        }
      } catch {}
    }
    setBatchQrCodes(codesMap);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Mesas e QR Codes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Cadastre mesas, configure placas físicas, gere e imprima QR Codes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenBatchPrint}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#FAF7F0] text-[#1E3A24] border border-[#CBD8CB] text-xs font-bold shadow-sm transition"
          >
            <Printer className="w-4 h-4 text-[#1E3A24]" />
            <span>Imprimir Várias Mesas</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E3A24] hover:bg-[#2A4E32] text-[#FAF7F0] text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Cadastrar Mesa</span>
          </button>
        </div>
      </div>

      {/* Grid de Mesas */}
      <div className="no-print bg-white rounded-2xl border border-[#EAE3D2] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[680px]">
            <thead className="bg-[#FAF7F0] text-[#1E3A24] border-b border-[#EAE3D2] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Número</th>
                <th className="py-3 px-4">Nome de Identificação</th>
                <th className="py-3 px-4">Avaliações Recebidas</th>
                <th className="py-3 px-4">Link Público</th>
                <th className="py-3 px-4 text-right">Ações & QR Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D2]/70">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#5C665D]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1E3A24]" />
                    Carregando mesas cadastradas...
                  </td>
                </tr>
              ) : tables.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#7D877E]">
                    Nenhuma mesa cadastrada. Clique em &quot;Cadastrar Mesa&quot; para iniciar.
                  </td>
                </tr>
              ) : (
                tables.map((t) => (
                  <tr key={t.id} className="hover:bg-[#FAF7F0]/60 transition">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(t)}
                        title={t.active ? 'Clique para desativar' : 'Clique para ativar'}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                          t.active
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-rose-50 hover:text-rose-700'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{t.active ? 'Ativa' : 'Inativa'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#1E3A24] text-sm">
                      #{String(t.number).padStart(2, '0')}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#1E3A24]">{t.name}</td>
                    <td className="py-3 px-4 text-[#5C665D] font-semibold">
                      {t._count?.reviews || 0} avaliações
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleCopyLink(t)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF7F0] hover:bg-[#F5EEDC] text-[#1E3A24] border border-[#CBD8CB] text-[11px] font-medium transition"
                      >
                        {copiedId === t.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Link Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar Link</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleViewQr(t)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-[#F5EEDC] text-[#1E3A24] border border-[#CBD8CB] font-bold text-xs transition"
                          title="Visualizar QR Code"
                        >
                          <QrCode className="w-3.5 h-3.5 text-[#3F643E]" />
                          <span>QR Code</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 rounded-lg text-[#5C665D] hover:text-[#1E3A24] hover:bg-[#FAF7F0] transition"
                          title="Editar Nome/Número"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Criação / Edição de Mesa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {editingTable ? 'Editar Mesa' : 'Nova Mesa'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTable} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Número da Mesa:</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formNumber}
                  onChange={(e) => setFormNumber(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nome / Descrição da Mesa:
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Mesa 01 - Salão Principal"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300"
                />
                <label htmlFor="activeCheck" className="font-semibold text-slate-700 cursor-pointer">
                  Mesa Ativa para receber avaliações
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Salvar Mesa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualização e Impressão de QR Code Individual */}
      {qrModalTable && (
        <div className="no-print fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">QR Code da Mesa</h2>
              <button
                onClick={() => setQrModalTable(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="mb-2 flex justify-center">
                <img
                  src="/logo-borelli.png"
                  alt="Gelato Borelli"
                  className="h-10 w-auto object-contain mx-auto"
                />
              </div>
              <span className="text-lg font-extrabold text-[#1E3A24] block">
                {qrModalTable.name}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Mesa #{String(qrModalTable.number).padStart(2, '0')}
              </span>
            </div>

            {/* Imagem do QR Code */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto">
              {qrCodeData ? (
                <img
                  src={qrCodeData}
                  alt={`QR Code Mesa ${qrModalTable.number}`}
                  className="w-48 h-48 mx-auto object-contain"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500">
              O cliente escaneia este QR Code diretamente com a câmera do celular para abrir o formulário da mesa.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleDownloadPng(qrModalTable)}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar PNG</span>
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Placa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visualização de Impressão em Lote (Folha de Mesas para Recorte) */}
      {batchPrintMode && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto p-8">
          <div className="no-print flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Folha de Impressão de Mesas e QR Codes
              </h2>
              <p className="text-xs text-slate-500">
                Imprima esta página para recortar e posicionar nas mesas do estabelecimento
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Agora (Ctrl + P)</span>
              </button>
              <button
                onClick={() => setBatchPrintMode(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Fechar Visualização
              </button>
            </div>
          </div>

          {/* Grid de Cartões de Mesa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables
              .filter((t) => t.active)
              .map((table) => (
                <div
                  key={table.id}
                  className="print-card p-6 bg-white border-2 border-dashed border-slate-300 rounded-3xl text-center flex flex-col items-center justify-between min-h-[360px]"
                >
                  <div className="w-full">
                    <div className="h-1 flex w-full mb-3 rounded-full overflow-hidden">
                      <div className="w-1/3 bg-[#009246]" />
                      <div className="w-1/3 bg-[#FFFFFF]" />
                      <div className="w-1/3 bg-[#CE2B37]" />
                    </div>
                    <div className="mb-2 flex justify-center">
                      <img
                        src="/logo-borelli.png"
                        alt="Gelato Borelli"
                        className="h-10 w-auto object-contain mx-auto"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-[#325032] uppercase tracking-widest block">
                      GELATO BORELLI
                    </span>
                    <h3 className="text-xl font-black text-[#1E3A24] mt-0.5">
                      {table.name}
                    </h3>
                  </div>

                  <div className="my-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                    {batchQrCodes[table.id] ? (
                      <img
                        src={batchQrCodes[table.id]}
                        alt={`QR Code Mesa ${table.number}`}
                        className="w-40 h-40 object-contain"
                      />
                    ) : (
                      <div className="w-40 h-40 flex items-center justify-center text-xs text-slate-400">
                        Carregando QR...
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-600">
                    <p className="font-semibold">Aponte a câmera do seu celular</p>
                    <p className="text-[11px] text-slate-400">Sua opinião é fundamental para nós!</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
