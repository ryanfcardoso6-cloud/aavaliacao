'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Key,
  Edit2,
  RefreshCw,
  X,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';

export default function UsuariosPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de Criação / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MANAGER' | 'ATTENDANT'>('ATTENDANT');
  const [active, setActive] = useState(true);

  const [modalError, setModalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/admin/usuarios')
      .then((res) => res.json())
      .then((d) => {
        setUsers(d.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('ATTENDANT');
    setActive(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: any) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword('');
    setRole(u.role);
    setActive(u.active);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setModalError(null);

    try {
      if (editingUser) {
        const payload: any = { name, email, role, active };
        if (password.trim()) payload.password = password.trim();

        const res = await fetch(`/api/admin/usuarios/${editingUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const d = await res.json();
        if (!res.ok) {
          setModalError(d.error || 'Erro ao atualizar usuário');
          setIsSaving(false);
          return;
        }
      } else {
        const res = await fetch('/api/admin/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role, active }),
        });

        const d = await res.json();
        if (!res.ok) {
          setModalError(d.error || 'Erro ao criar usuário');
          setIsSaving(false);
          return;
        }
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch {
      setModalError('Erro de conexão');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E3A24] tracking-tight">
            Gestão de Usuários & Acessos
          </h1>
          <p className="text-xs sm:text-sm text-[#5C665D] mt-1">
            Controle de perfis (Administrador, Gerente e Atendente) e permissões da Gelato Borelli
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E3A24] hover:bg-[#2A4E32] text-[#FAF7F0] text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Lista de Usuários */}
      <div className="bg-white rounded-2xl border border-[#EAE3D2] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-[#FAF7F0] text-[#1E3A24] border-b border-[#EAE3D2] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Nome do Colaborador</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4">Perfil de Acesso</th>
                <th className="py-3 px-4">Criado em</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D2]/70">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#5C665D]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1E3A24]" />
                    Carregando usuários...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FAF7F0]/60 transition">
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {u.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#1E3A24]">{u.name}</td>
                    <td className="py-3 px-4 text-[#5C665D]">{u.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          u.role === 'ADMIN'
                            ? 'bg-[#E4EBE4] text-[#1E3A24] border-[#CBD8CB]'
                            : u.role === 'MANAGER'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <Shield className="w-3 h-3 text-[#3F643E]" />
                        <span>
                          {u.role === 'ADMIN'
                            ? 'Administrador'
                            : u.role === 'MANAGER'
                            ? 'Gerente'
                            : 'Atendente'}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#7D877E]">
                      {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 rounded-lg text-[#5C665D] hover:text-[#1E3A24] hover:bg-[#FAF7F0] transition"
                        title="Editar Usuário"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar / Editar Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#EAE3D2] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D2]">
              <h2 className="text-base font-bold text-[#1E3A24]">
                {editingUser ? 'Editar Usuário' : 'Novo Colaborador'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#5C665D] hover:text-[#1E3A24] hover:bg-[#FAF7F0]"
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

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do colaborador"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-mail:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colaborador@loja.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {editingUser ? 'Nova Senha (deixe em branco para manter a atual):' : 'Senha de Acesso:'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 8 caracteres"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Perfil de Acesso:</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium outline-none focus:border-brand-500"
                >
                  <option value="ATTENDANT">Atendente (Visualização e atendimento)</option>
                  <option value="MANAGER">Gerente (Relatórios, status e exportação)</option>
                  <option value="ADMIN">Administrador (Acesso total)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeUserCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300"
                />
                <label htmlFor="activeUserCheck" className="font-semibold text-slate-700 cursor-pointer">
                  Usuário Ativo no sistema
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
                  <span>Salvar Usuário</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
