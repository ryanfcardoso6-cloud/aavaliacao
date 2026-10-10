/**
 * Utilitário para formatar e gerar links diretos para o WhatsApp do cliente
 */
export function getWhatsAppUrl(phone?: string | null, customerName?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return null;

  // Se for celular brasileiro sem o código do país (+55), adiciona automaticamente
  const fullPhone = (digits.length === 10 || digits.length === 11) ? `55${digits}` : digits;

  const greeting = customerName && customerName.trim() ? `Olá, ${customerName.trim()}!` : 'Olá!';
  const text = encodeURIComponent(`${greeting} Aqui é da equipe Gelato Borelli a respeito do seu atendimento recente.`);

  return `https://wa.me/${fullPhone}?text=${text}`;
}
