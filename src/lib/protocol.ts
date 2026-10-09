import crypto from 'crypto';

/**
 * Gera um protocolo não-sequencial e imprevisível para identificação de feedbacks/reclamações
 * Exemplo: PRT-2026-7K8M9Q
 */
export function generateProtocol(prefix: string = 'PRT'): string {
  const year = new Date().getFullYear();
  // 6 caracteres aleatórios base32 legíveis (sem 0/O e 1/I para evitar confusão)
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const randomBytes = crypto.randomBytes(6);
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += chars[randomBytes[i] % chars.length];
  }
  return `${prefix}-${year}-${randomStr}`;
}
