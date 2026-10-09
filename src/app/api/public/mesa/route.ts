import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token') || searchParams.get('mesa');

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Identificador da mesa não informado' },
        { status: 400 }
      );
    }

    // Busca por token ou slug
    const table = await prisma.table.findFirst({
      where: {
        OR: [{ token: token }, { slug: token }],
      },
      select: {
        id: true,
        number: true,
        name: true,
        token: true,
        active: true,
      },
    });

    if (!table) {
      return NextResponse.json(
        { valid: false, error: 'Mesa não encontrada no sistema' },
        { status: 404 }
      );
    }

    if (!table.active) {
      return NextResponse.json(
        { valid: false, error: 'Esta mesa está temporariamente desativada para avaliações' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      valid: true,
      table: {
        number: table.number,
        name: table.name,
        token: table.token,
      },
    });
  } catch (error) {
    console.error('Erro ao consultar mesa:', error);
    return NextResponse.json(
      { valid: false, error: 'Erro ao validar a mesa' },
      { status: 500 }
    );
  }
}
