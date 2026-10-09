import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(5, parseInt(searchParams.get('limit') || '15')));
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const assignedToId = searchParams.get('assignedToId');
    const search = searchParams.get('search')?.trim();

    const where: any = {};

    if (status && status !== 'TODOS') {
      where.status = status;
    }

    if (category && category !== 'TODOS') {
      where.category = category;
    }

    if (assignedToId) {
      if (assignedToId === 'UNASSIGNED') {
        where.assignedToId = null;
      } else {
        where.assignedToId = assignedToId;
      }
    }

    if (search) {
      where.OR = [
        { protocol: { contains: search } },
        { description: { contains: search } },
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
      ];
    }

    const [total, complaints] = await Promise.all([
      prisma.complaint.count({ where }),
      prisma.complaint.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          review: {
            select: {
              rating: true,
              comment: true,
              viewedByStaff: true,
              table: { select: { number: true, name: true } },
            },
          },
          assignedTo: {
            select: { id: true, name: true, role: true },
          },
          _count: {
            select: { notes: true, history: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      complaints,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Erro ao listar reclamações:', error);
    return NextResponse.json({ error: 'Erro ao buscar reclamações' }, { status: 500 });
  }
}
