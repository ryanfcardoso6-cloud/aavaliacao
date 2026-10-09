import { z } from 'zod';

export const COMPLAINT_CATEGORIES = [
  'ATENDIMENTO',
  'DEMORA',
  'PEDIDO_INCORRETO',
  'QUALIDADE',
  'LIMPEZA',
  'AMBIENTE',
  'PAGAMENTO',
  'OUTRO',
] as const;

export const COMPLAINT_STATUSES = [
  'NOVA',
  'EM_ATENDIMENTO',
  'AGUARDANDO_RETORNO',
  'RESOLVIDA',
  'ARQUIVADA',
] as const;

export const USER_ROLES = ['ADMIN', 'MANAGER', 'ATTENDANT'] as const;

export const CONTACT_PREFERENCES = ['WHATSAPP', 'EMAIL', 'TELEFONE', 'NENHUM'] as const;

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido').max(100),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(100),
});

export const complaintInputSchema = z.object({
  category: z.enum(COMPLAINT_CATEGORIES, {
    errorMap: () => ({ message: 'Selecione uma categoria válida' }),
  }),
  description: z.string().min(5, 'Descreva o ocorrido com pelo menos 5 caracteres').max(2000, 'Máximo de 2000 caracteres'),
  customerName: z.string().max(100, 'Nome muito longo').optional().or(z.literal('')),
  customerPhone: z.string().max(20, 'Telefone inválido').optional().or(z.literal('')),
  customerEmail: z.string().email('E-mail de contato inválido').max(100).optional().or(z.literal('')),
  contactPreference: z.enum(CONTACT_PREFERENCES).default('NENHUM'),
  requestContact: z.boolean().default(false),
}).refine(
  (data) => {
    if (data.requestContact) {
      const hasPhone = !!data.customerPhone && data.customerPhone.trim().length > 7;
      const hasEmail = !!data.customerEmail && data.customerEmail.trim().length > 4;
      return hasPhone || hasEmail;
    }
    return true;
  },
  {
    message: 'Para solicitar retorno da equipe, informe ao menos um meio de contato válido (WhatsApp, Telefone ou E-mail).',
    path: ['requestContact'],
  }
);

export const reviewSubmissionSchema = z.object({
  rating: z.number().int().min(1, 'Nota mínima é 1').max(5, 'Nota máxima é 5'),
  comment: z.string().max(1000, 'Comentário muito longo (máximo 1000 caracteres)').optional().or(z.literal('')),
  tableToken: z.string().max(100).optional().or(z.literal('')),
  complaint: complaintInputSchema.optional(),
});

export const tableSchema = z.object({
  number: z.number().int().positive('Número da mesa deve ser maior que zero'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50, 'Nome muito longo'),
  active: z.boolean().default(true),
});

export const userCreateSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('E-mail inválido').max(100),
  password: z.string().min(8, 'A senha deve conter pelo menos 8 caracteres').max(100),
  role: z.enum(USER_ROLES, {
    errorMap: () => ({ message: 'Perfil de usuário inválido' }),
  }),
  active: z.boolean().default(true),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(100),
  password: z.string().min(8).max(100).optional().or(z.literal('')),
  role: z.enum(USER_ROLES),
  active: z.boolean(),
});

export const statusUpdateSchema = z.object({
  status: z.enum(COMPLAINT_STATUSES, {
    errorMap: () => ({ message: 'Status inválido' }),
  }),
  note: z.string().max(1000).optional(),
});

export const internalNoteSchema = z.object({
  content: z.string().min(2, 'A nota deve conter pelo menos 2 caracteres').max(2000, 'Máximo 2000 caracteres'),
});

export const assignComplaintSchema = z.object({
  assignedToId: z.string().nullable(),
});

export const storeConfigSchema = z.object({
  storeName: z.string().min(2, 'Nome da loja é obrigatório').max(100),
  logoUrl: z.string().url('URL da logo inválida').optional().or(z.literal('')),
  description: z.string().max(255).optional().or(z.literal('')),
  welcomeMessage: z.string().min(3).max(255),
  subtitleMessage: z.string().min(3).max(255),
  thankYouPositive: z.string().min(3).max(500),
  thankYouNegative: z.string().min(3).max(500),
  slaHours: z.number().int().min(1, 'SLA deve ser de pelo menos 1 hora').max(720),
  phone: z.string().max(30).optional().or(z.literal('')),
  email: z.string().email('E-mail institucional inválido').optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
  businessHours: z.string().max(255).optional().or(z.literal('')),
});
