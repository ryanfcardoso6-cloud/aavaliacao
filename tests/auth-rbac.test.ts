import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  comparePassword,
  createSessionToken,
  verifySessionToken,
  canManageUsers,
  canManageStoreConfig,
  canManageTables,
  canExportReports,
  canChangeComplaintStatus,
} from '../src/lib/auth';

describe('Autenticação e Controle de Acesso Baseado em Perfis (RBAC)', () => {
  describe('Criptografia e Validação de Senhas', () => {
    it('deve gerar hashes com bcrypt e verificar senhas corretamente', async () => {
      const password = 'MinhaSenhaSegura@2026';
      const hash = await hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2')).toBe(true);

      const isMatch = await comparePassword(password, hash);
      expect(isMatch).toBe(true);

      const isWrong = await comparePassword('SenhaErrada', hash);
      expect(isWrong).toBe(false);
    });
  });

  describe('Tokens de Sessão JWT Assinados', () => {
    it('deve criar e validar tokens de sessão válidos', async () => {
      const payload = {
        userId: 'usr_123',
        email: 'admin@loja.com',
        name: 'Carlos Admin',
        role: 'ADMIN' as const,
      };

      const token = await createSessionToken(payload);
      expect(typeof token).toBe('string');

      const verified = await verifySessionToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(payload.userId);
      expect(verified?.email).toBe(payload.email);
      expect(verified?.role).toBe('ADMIN');
    });

    it('deve rejeitar tokens corrompidos ou adulterados', async () => {
      const corrupted = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.corrompido.assinatura';
      const result = await verifySessionToken(corrupted);
      expect(result).toBeNull();
    });
  });

  describe('Matriz de Permissões por Perfil', () => {
    it('Administrador deve ter acesso total (usuários, configurações, mesas, exportação)', () => {
      expect(canManageUsers('ADMIN')).toBe(true);
      expect(canManageStoreConfig('ADMIN')).toBe(true);
      expect(canManageTables('ADMIN')).toBe(true);
      expect(canExportReports('ADMIN')).toBe(true);
      expect(canChangeComplaintStatus('ADMIN')).toBe(true);
    });

    it('Gerente NÃO pode gerenciar usuários nem alterar configurações críticas, mas pode atender e exportar', () => {
      expect(canManageUsers('MANAGER')).toBe(false);
      expect(canManageStoreConfig('MANAGER')).toBe(false);
      expect(canManageTables('MANAGER')).toBe(true);
      expect(canExportReports('MANAGER')).toBe(true);
      expect(canChangeComplaintStatus('MANAGER')).toBe(true);
    });

    it('Atendente NÃO pode gerenciar usuários, configurações, mesas ou exportar dados', () => {
      expect(canManageUsers('ATTENDANT')).toBe(false);
      expect(canManageStoreConfig('ATTENDANT')).toBe(false);
      expect(canManageTables('ATTENDANT')).toBe(false);
      expect(canExportReports('ATTENDANT')).toBe(false);
      // Atendente pode alterar status da reclamação em atendimento
      expect(canChangeComplaintStatus('ATTENDANT')).toBe(true);
    });
  });
});
