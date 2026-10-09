import { describe, it, expect } from 'vitest';
import { sanitizeCsvField, sanitizeText, maskEmail, maskPhone } from '../src/lib/security';

describe('Módulo de Segurança e Prevenção de Ataques', () => {
  describe('Proteção contra CSV Formula Injection (CWE-1236)', () => {
    it('deve neutralizar caracteres perigosos no início de campos CSV', () => {
      const formula1 = '=cmd|"/C calc"!A0';
      const formula2 = '+12345';
      const formula3 = '-5+2';
      const formula4 = '@SUM(A1:A10)';

      expect(sanitizeCsvField(formula1)).toBe('"\'=cmd|""/C calc""!A0"');
      expect(sanitizeCsvField(formula2)).toBe('"\'\+12345"');
      expect(sanitizeCsvField(formula3)).toBe('"\'\-5+2"');
      expect(sanitizeCsvField(formula4)).toBe('"\'\@SUM(A1:A10)"');
    });

    it('deve formatar texto seguro entre aspas e escapar aspas internas', () => {
      const normal = 'Atendimento excelente na "Mesa 02"';
      expect(sanitizeCsvField(normal)).toBe('"Atendimento excelente na ""Mesa 02"""');
    });

    it('deve tratar valores nulos ou indefinidos de forma segura', () => {
      expect(sanitizeCsvField(null)).toBe('');
      expect(sanitizeCsvField(undefined)).toBe('');
    });
  });

  describe('Sanitização contra XSS', () => {
    it('deve escapar tags HTML e scripts em textos inseridos', () => {
      const xssPayload = '<script>alert("hack")</script>';
      const sanitized = sanitizeText(xssPayload);
      expect(sanitized).toBe('&lt;script&gt;alert(&quot;hack&quot;)&lt;/script&gt;');
      expect(sanitized).not.toContain('<script>');
    });
  });

  describe('Anonimização e LGPD', () => {
    it('deve mascarar e-mails para relatórios não privilegiados', () => {
      expect(maskEmail('cliente.teste@exemplo.com')).toMatch(/^c\*+e@exemplo\.com$/);
      expect(maskEmail(null)).toBe('');
    });

    it('deve mascarar telefones preservando apenas os dígitos finais', () => {
      expect(maskPhone('(11) 98765-4321')).toBe('(**) *****-4321');
      expect(maskPhone(null)).toBe('');
    });
  });
});
