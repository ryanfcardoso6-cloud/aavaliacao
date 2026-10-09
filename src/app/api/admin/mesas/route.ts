import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, canManageTables } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { tableSchema } from '@/lib/validations';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const tables = await prisma.table.findMany({
      orderBy: { number: 'asc' },
      include: {
        _count: {
          select: { reviews: true },
        },
      },
    });

    return NextResponse.json({ tables });
  } catch (error) {
    console.error('Erro ao listar mesas:', error);
    return NextResponse.json({ error: 'Erro ao listar mesas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  if (!canManageTables(session.role)) {
    return NextResponse.json({ error: 'Permissão insuficiente' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parseResult = tableSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { number, name, active } = parseResult.data;

    // Verifica se já existe mesa com esse número
    const existingNumber = await prisma.table.findUnique({
      where: { number },
    });
    if (existingNumber) {
      return NextResponse.json(
        { error: `Já existe uma mesa cadastrada com o número ${number}` },
        { status: 400 }
      );
    }

    const slug = `mesa-${String(number).padStart(2, '0')}`;
    const token = `tb_m${number}_${crypto.randomBytes(6).toString('hex')}`;

    const newTable = await prisma.table.create({
      data: {
        number,
        name,
        slug,
        token,
        active: active !== undefined ? active : true,
      },
    });

    // Auditoria
    await prisma.auditEvent.create({
      data: {
        userId: session.userId,
        action: 'CRIAR_MESA',
        resource: 'TABLE',
        resourceId: newTable.id,
        details: `Mesa ${number} (${name}) criada por ${session.name}.`,
      },
    });

    return NextResponse.json({ success: true, table: newTable }, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar mesa:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar mesa' }, { status: 500 });
  }
}
