/**
 * Sanitiza valores contra CSV Formula Injection (CWE-1236).
 * Se o valor iniciar com =, +, -, @, \t ou \r, adiciona uma aspa simples (') no início.
 */
export function sanitizeCsvField(value: any): string {
  if (value === null || value === undefined) return '';
  let str = String(value);

  // Remove quebras de linha que possam quebrar o formato CSV
  str = str.replace(/[\r\n]+/g, ' ').trim();

  // Se começar com caracteres interpretáveis como fórmula em Excel/LibreOffice/Google Sheets
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'` + str;
  }

  // Escapar aspas duplas internas e envolver em aspas
  str = `"${str.replace(/"/g, '""')}"`;

  return str;
}

/**
 * Sanitiza texto simples para evitar injeções ou tags HTML não autorizadas
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Mascara e-mails para proteção de privacidade (LGPD)
 * Ex: usuario@empresa.com -> u***o@empresa.com
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return '';
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name[0]}${'*'.repeat(Math.max(name.length - 2, 3))}${name[name.length - 1]}@${domain}`;
}

/**
 * Mascara telefones para exibição segura
 * Ex: (11) 98765-4321 -> (11) *****-4321
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return '****';
  const last4 = digits.slice(-4);
  return `(**) *****-${last4}`;
}
