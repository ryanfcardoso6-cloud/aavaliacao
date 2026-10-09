import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, canManageTables } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateTableSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  number: z.number().int().positive().optional(),
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

  if (!canManageTables(session.role)) {
    return NextResponse.json({ error: 'Permissão insuficiente' }, { status: 403 });
  }

  try {
    const { id } = params;
    const body = await req.json();
    const parseResult = updateTableSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { name, number, active } = parseResult.data;

    const existing = await prisma.table.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Mesa não encontrada' }, { status: 404 });
    }

    // Se mudou o número, verificar conflito
    if (number && number !== existing.number) {
      const conflict = await prisma.table.findUnique({
        where: { number },
      });
      if (conflict) {
        return NextResponse.json(
          { error: `Já existe uma mesa com o número ${number}` },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.table.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(number !== undefined && {
          number,
          slug: `mesa-${String(number).padStart(2, '0')}`,
        }),
        ...(active !== undefined && { active }),
      },
    });

    await prisma.auditEvent.create({
      data: {
        userId: session.userId,
        action: 'ATUALIZAR_MESA',
        resource: 'TABLE',
        resourceId: id,
        details: `Mesa ${updated.number} atualizada por ${session.name}. Ativa: ${updated.active}.`,
      },
    });

    return NextResponse.json({ success: true, table: updated });
  } catch (error) {
    console.error('Erro ao atualizar mesa:', error);
    return NextResponse.json({ error: 'Erro ao atualizar mesa' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  if (!canManageTables(session.role)) {
    return NextResponse.json({ error: 'Permissão insuficiente' }, { status: 403 });
  }

  try {
    const { id } = params;

    // Em vez de deletar e apagar histórico de avaliações, desativa a mesa com segurança
    const table = await prisma.table.update({
      where: { id },
      data: { active: false },
    });

    await prisma.auditEvent.create({
      data: {
        userId: session.userId,
        action: 'DESATIVAR_MESA',
        resource: 'TABLE',
        resourceId: id,
        details: `Mesa ${table.number} desativada por ${session.name}.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Mesa desativada com sucesso para preservar histórico.',
      table,
    });
  } catch (error) {
    console.error('Erro ao desativar mesa:', error);
    return NextResponse.json({ error: 'Erro ao desativar mesa' }, { status: 500 });
  }
}
