'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MessageSquareWarning,
  Star,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Send,
  Loader2,
  Lock,
  History,
  FileText,
  ShieldCheck,
  Check,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'NOVA', label: 'Nova' },
  { value: 'EM_ATENDIMENTO', label: 'Em Atendimento' },
  { value: 'AGUARDANDO_RETORNO', label: 'Aguardando Retorno do Cliente' },
  { value: 'RESOLVIDA', label: 'Resolvida' },
  { value: 'ARQUIVADA', label: 'Arquivada' },
];

export default function ReclamacaoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);

  // Form states
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [newInternalNote, setNewInternalNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadComplaint = () => {
    fetch(`/api/admin/reclamacoes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.complaint) {
          setComplaint(data.complaint);
          setNewStatus(data.complaint.status);
          setSelectedAssignee(data.complaint.assignedToId || '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadComplaint();

    // Carrega usuário atual
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((d) => setCurrentUser(d.user))
      .catch(() => {});

    // Carrega lista de usuários caso seja admin para atribuição
    fetch('/api/admin/usuarios')
      .then((res) => res.json())
      .then((d) => setUsersList(d.users || []))
      .catch(() => {});
  }, [id]);

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingStatus(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch(`/api/admin/reclamacoes/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note: statusNote }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedbackMsg({ type: 'error', text: data.error || 'Erro ao atualizar status' });
      } else {
        setFeedbackMsg({ type: 'success', text: 'Status atualizado com sucesso!' });
        setStatusNote('');
        loadComplaint();
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Erro de conexão com o servidor' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInternalNote.trim()) return;

    setIsAddingNote(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch(`/api/admin/reclamacoes/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newInternalNote }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedbackMsg({ type: 'error', text: data.error || 'Erro ao adicionar nota' });
      } else {
        setFeedbackMsg({ type: 'success', text: 'Nota interna adicionada com sucesso!' });
        setNewInternalNote('');
        loadComplaint();
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Erro de conexão' });
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleAssign = async (assigneeId: string) => {
    setIsAssigning(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch(`/api/admin/reclamacoes/${id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: assigneeId || null }),
      });

      if (res.ok) {
        setFeedbackMsg({ type: 'success', text: 'Responsável atualizado com sucesso!' });
        loadComplaint();
      } else {
        setFeedbackMsg({ type: 'error', text: 'Erro ao atribuir responsável' });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Erro de comunicação' });
    } finally {
      setIsAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <span className="text-xs">Carregando detalhes da reclamação...</span>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-800">Reclamação não encontrada</h2>
        <Link href="/admin/reclamacoes" className="mt-4 inline-block text-xs text-brand-600 font-bold">
          Voltar para listagem
        </Link>
      </div>
    );
  }

  const review = complaint.review;
  const table = review?.table;

  return (
    <div className="space-y-6">
      {/* Botão Voltar e Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/reclamacoes"
            className="p-2 rounded-xl bg-white border border-[#CBD8CB] text-[#1E3A24] hover:bg-[#FAF7F0] transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#E4EBE4] text-[#1E3A24]">
                {complaint.protocol}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                {complaint.status}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-[#1E3A24] mt-1">
              Atendimento de Reclamação: {complaint.category}
            </h1>
          </div>
        </div>

        {/* Atribuição Rápida */}
        <div className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-[#EAE3D2] shadow-sm text-xs">
          <UserCheck className="w-4 h-4 text-[#3F643E] ml-1" />
          <span className="text-[#5C665D] font-semibold">Responsável:</span>
          <select
            value={selectedAssignee}
            disabled={isAssigning}
            onChange={(e) => {
              setSelectedAssignee(e.target.value);
              handleAssign(e.target.value);
            }}
            className="px-2 py-1 bg-[#FAF7F0] rounded-lg border border-[#CBD8CB] text-xs font-semibold text-[#1E3A24] outline-none"
          >
            <option value="">(Não atribuído)</option>
            {currentUser && (
              <option value={currentUser.userId}>
                Atribuir a mim ({currentUser.name})
              </option>
            )}
            {usersList.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Grid Principal: Detalhes e Ações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2: Informações da Ocorrência e Notas Internas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card dos Detalhes do Ocorrido */}
          <div className="bg-white rounded-2xl border border-[#EAE3D2] p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#1E3A24] border-b border-[#EAE3D2] pb-3 flex items-center justify-between">
              <span>Informações Fornecidas pelo Cliente</span>
              <span className="text-xs font-normal text-[#7D877E]">
                {new Date(complaint.createdAt).toLocaleString('pt-BR')}
              </span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#EAE3D2]">
                <span className="text-[#7D877E] block mb-0.5">Mesa:</span>
                <span className="font-bold text-[#1E3A24]">
                  {table ? `Mesa ${table.number} - ${table.name}` : 'Não identificada'}
                </span>
              </div>
              <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#EAE3D2]">
                <span className="text-[#7D877E] block mb-0.5">Nota Atribuída:</span>
                <span className="font-bold text-amber-500 flex items-center gap-1">
                  {review?.rating} <Star className="w-3.5 h-3.5 fill-amber-500" />
                </span>
              </div>
              <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#EAE3D2]">
                <span className="text-[#7D877E] block mb-0.5">Categoria:</span>
                <span className="font-bold text-[#1E3A24]">{complaint.category}</span>
              </div>
            </div>

            {/* Descrição do Cliente */}
            <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-rose-900 block">Relato do Cliente:</span>
              <p className="text-slate-800 leading-relaxed whitespace-pre-line text-sm">
                {complaint.description}
              </p>
            </div>

            {/* Dados de Contato e Preferência */}
            <div className="p-4 bg-[#FAF7F0] rounded-2xl border border-[#EAE3D2] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1E3A24] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Dados de Contato (LGPD)
                </span>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  complaint.requestContact ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-slate-200 text-slate-700'
                }`}>
                  {complaint.requestContact ? 'Solicitou Retorno Ativo' : 'Feedback Anônimo'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-slate-700">
                <div>
                  <strong>Nome:</strong> {complaint.customerName || 'Não informado'}
                </div>
                <div>
                  <strong>WhatsApp/Telefone:</strong>{' '}
                  {complaint.customerPhone ? (
                    <a href={`tel:${complaint.customerPhone}`} className="text-[#1E3A24] font-semibold underline">
                      {complaint.customerPhone}
                    </a>
                  ) : (
                    'Não informado'
                  )}
                </div>
                <div>
                  <strong>E-mail:</strong>{' '}
                  {complaint.customerEmail ? (
                    <a href={`mailto:${complaint.customerEmail}`} className="text-[#1E3A24] font-semibold underline">
                      {complaint.customerEmail}
                    </a>
                  ) : (
                    'Não informado'
                  )}
                </div>
              </div>
              {complaint.contactPreference && complaint.contactPreference !== 'NENHUM' && (
                <div className="text-[11px] text-[#5C665D] pt-1">
                  Preferência informada: <strong>{complaint.contactPreference}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Observações Internas Privadas (Privacidade absoluta da equipe) */}
          <div className="bg-white rounded-2xl border border-[#EAE3D2] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-[#1E3A24]">Observações Internas Privadas</h2>
              </div>
              <span className="text-[11px] text-[#7D877E]">
                Visível apenas para colaboradores (Admin, Gerente e Atendente)
              </span>
            </div>

            {/* Formulário para adicionar nota interna */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                value={newInternalNote}
                onChange={(e) => setNewInternalNote(e.target.value)}
                placeholder="Ex: Entrei em contato com o cliente. Oferecido novo gelato artesanal. Caso tratado..."
                rows={3}
                required
                className="w-full p-3 text-xs sm:text-sm rounded-xl border border-[#CBD8CB] bg-[#FAF7F0]/40 focus:border-[#1E3A24] text-[#1E3A24] outline-none transition"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isAddingNote || !newInternalNote.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E3A24] hover:bg-[#2A4E32] disabled:opacity-50 text-[#FAF7F0] rounded-xl text-xs font-bold transition shadow-sm"
                >
                  {isAddingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-amber-300" />}
                  <span>Registrar Observação</span>
                </button>
              </div>
            </form>

            {/* Lista de Notas Internas */}
            <div className="space-y-3 pt-2">
              {complaint.notes && complaint.notes.length > 0 ? (
                complaint.notes.map((note: any) => (
                  <div key={note.id} className="p-3 bg-[#FAF7F0] rounded-xl border border-[#EAE3D2] text-xs space-y-1">
                    <div className="flex items-center justify-between text-[#7D877E] text-[11px]">
                      <span className="font-semibold text-[#1E3A24]">
                        {note.user?.name} ({note.user?.role})
                      </span>
                      <span>{new Date(note.createdAt).toLocaleString('pt-BR')}</span>
                    </div>
                    <p className="text-[#1E3A24] leading-relaxed">{note.content}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-[#7D877E]">
                  Nenhuma nota interna registrada ainda.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coluna 3: Alteração de Status & Linha do Tempo Auditada */}
        <div className="space-y-6">
          {/* Atualização de Status */}
          <div className="bg-white rounded-2xl border border-[#EAE3D2] p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#1E3A24] border-b border-[#EAE3D2] pb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#3F643E]" />
              <span>Alterar Status do Atendimento</span>
            </h2>

            <form onSubmit={handleStatusChange} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#5C665D] font-semibold mb-1">Novo Status:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#CBD8CB] bg-white font-medium text-[#1E3A24] outline-none"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#5C665D] font-semibold mb-1">
                  Justificativa / Motivo da mudança (Opcional):
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Explique o motivo da alteração..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-[#CBD8CB] bg-[#FAF7F0]/40 text-[#1E3A24] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingStatus || newStatus === complaint.status}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A24] hover:bg-[#2A4E32] disabled:opacity-50 text-[#FAF7F0] font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                {isUpdatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Atualizar Status</span>
              </button>
            </form>
          </div>

          {/* Linha do Tempo Auditada (Histórico Imutável no Servidor) */}
          <div className="bg-white rounded-2xl border border-[#EAE3D2] p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#EAE3D2] pb-3">
              <History className="w-4 h-4 text-[#3F643E]" />
              <h2 className="text-sm font-bold text-[#1E3A24]">Histórico de Auditoria</h2>
            </div>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EAE3D2]">
              {complaint.history && complaint.history.length > 0 ? (
                complaint.history.map((h: any) => (
                  <div key={h.id} className="relative pl-7 text-xs space-y-0.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1E3A24] absolute left-2 top-1.5 ring-4 ring-white" />
                    <div className="flex items-center justify-between text-[11px] text-[#7D877E]">
                      <span className="font-semibold text-[#1E3A24]">{h.userName || 'Sistema'}</span>
                      <span>
                        {new Date(h.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[#5C665D] leading-tight">{h.details}</p>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#7D877E] pl-7">Sem histórico registrado.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
