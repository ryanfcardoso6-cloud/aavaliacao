import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, canManageUsers, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { USER_ROLES } from '@/lib/validations';

const userEditSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().max(100).optional(),
  password: z.string().min(8).max(100).optional().or(z.literal('')),
  role: z.enum(USER_ROLES).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  if (!canManageUsers(session.role)) {
    return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
  }

  try {
    const { id } = params;
    const body = await req.json();
    const parseResult = userEditSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password, role, active } = parseResult.data;

    const existing = await prisma.user.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Se estiver desativando a si próprio, bloquear para não trancar o sistema
    if (id === session.userId && active === false) {
      return NextResponse.json(
        { error: 'Você não pode desativar sua própria conta de administrador' },
        { status: 400 }
      );
    }

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email.toLowerCase();
    if (role) dataToUpdate.role = role;
    if (active !== undefined) dataToUpdate.active = active;
    if (password && password.trim().length >= 8) {
      dataToUpdate.passwordHash = await hashPassword(password);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    });

    await prisma.auditEvent.create({
      data: {
        userId: session.userId,
        action: 'EDITAR_USUARIO',
        resource: 'USER',
        resourceId: id,
        details: `Usuário ${updated.email} atualizado por ${session.name}.`,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error('Erro ao editar usuário:', error);
    return NextResponse.json({ error: 'Erro ao editar usuário' }, { status: 500 });
  }
}
