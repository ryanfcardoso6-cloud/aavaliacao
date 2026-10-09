import { describe, it, expect } from 'vitest';
import {
  reviewSubmissionSchema,
  loginSchema,
  tableSchema,
  complaintInputSchema,
} from '../src/lib/validations';

describe('Validações de Entrada (Zod Schemas)', () => {
  describe('Validação de Avaliação (Review)', () => {
    it('deve aceitar avaliações válidas com nota de 1 a 5', () => {
      const valid5 = { rating: 5, comment: 'Tudo excelente!' };
      const valid1 = { rating: 1 };

      expect(reviewSubmissionSchema.safeParse(valid5).success).toBe(true);
      expect(reviewSubmissionSchema.safeParse(valid1).success).toBe(true);
    });

    it('deve rejeitar notas fora do intervalo permitido (< 1 ou > 5)', () => {
      expect(reviewSubmissionSchema.safeParse({ rating: 0 }).success).toBe(false);
      expect(reviewSubmissionSchema.safeParse({ rating: 6 }).success).toBe(false);
      expect(reviewSubmissionSchema.safeParse({ rating: 3.5 }).success).toBe(false);
    });
  });

  describe('Validação de Reclamação Condicional', () => {
    it('deve rejeitar descrição muito curta', () => {
      const invalid = {
        category: 'ATENDIMENTO',
        description: 'ruim', // menos de 5 caracteres
        requestContact: false,
      };
      expect(complaintInputSchema.safeParse(invalid).success).toBe(false);
    });

    it('deve rejeitar se o cliente solicitar retorno sem informar telefone ou email', () => {
      const semContato = {
        category: 'ATENDIMENTO',
        description: 'O pedido demorou bastante tempo',
        requestContact: true,
        customerPhone: '',
        customerEmail: '',
      };
      expect(complaintInputSchema.safeParse(semContato).success).toBe(false);
    });

    it('deve aceitar quando retorno é solicitado e telefone válido é fornecido', () => {
      const comTelefone = {
        category: 'DEMORA',
        description: 'O pedido demorou mais de uma hora',
        requestContact: true,
        customerPhone: '(11) 98765-4321',
      };
      expect(complaintInputSchema.safeParse(comTelefone).success).toBe(true);
    });
  });

  describe('Validação de Login e Mesas', () => {
    it('deve validar emails e senhas no schema de login', () => {
      expect(loginSchema.safeParse({ email: 'admin@loja.com', password: '123' }).success).toBe(false); // senha < 6
      expect(loginSchema.safeParse({ email: 'invalido', password: 'senha123' }).success).toBe(false); // email invalido
      expect(loginSchema.safeParse({ email: 'admin@loja.com', password: 'senhaValida123' }).success).toBe(true);
    });

    it('deve exigir número positivo no cadastro de mesas', () => {
      expect(tableSchema.safeParse({ number: 0, name: 'Mesa 00' }).success).toBe(false);
      expect(tableSchema.safeParse({ number: 5, name: 'Mesa 05' }).success).toBe(true);
    });
  });
});
