import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'feedback-loja-super-seguro-jwt-secret-key-com-min-32-chars-2026'
);

export const SESSION_COOKIE_NAME = 'feedback_admin_session';

export type UserRole = 'ADMIN' | 'MANAGER' | 'ATTENDANT';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  [key: string]: any;
}

/**
 * Gera hash seguro de senha usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compara senha em texto plano com o hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Cria token de sessão JWT assinado
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Valida token de sessão JWT
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Recupera a sessão atual a partir das requisições com cookies (Server Actions / Route Handlers)
 */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Extrai sessão a partir de NextRequest (Middleware / Route Handlers)
 */
export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// Helpers de permissão baseados em perfil (RBAC)
export function isAtLeastRole(currentRole: UserRole, requiredRole: UserRole): boolean {
  const hierarchy: Record<UserRole, number> = {
    ATTENDANT: 1,
    MANAGER: 2,
    ADMIN: 3,
  };
  return hierarchy[currentRole] >= hierarchy[requiredRole];
}

export function canManageUsers(role: UserRole): boolean {
  return role === 'ADMIN';
}

export function canManageStoreConfig(role: UserRole): boolean {
  return role === 'ADMIN';
}

export function canManageTables(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'MANAGER';
}

export function canExportReports(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'MANAGER';
}

export function canChangeComplaintStatus(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'MANAGER' || role === 'ATTENDANT';
}

export function canAddInternalNote(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'MANAGER' || role === 'ATTENDANT';
}
