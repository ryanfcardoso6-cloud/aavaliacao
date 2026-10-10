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
    const ratingParam = searchParams.get('rating');
    const tableId = searchParams.get('tableId');
    const hasComment = searchParams.get('hasComment');
    const hasComplaint = searchParams.get('hasComplaint');
    const search = searchParams.get('search')?.trim();
    const period = searchParams.get('period'); // 'hoje', '7dias', '30dias'

    const where: any = {};

    if (ratingParam) {
      where.rating = parseInt(ratingParam);
    }

    if (tableId) {
      where.tableId = tableId;
    }

    if (hasComment === 'true') {
      where.comment = { not: null };
    } else if (hasComment === 'false') {
      where.comment = null;
    }

    if (hasComplaint === 'true') {
      where.complaint = { isNot: null };
    } else if (hasComplaint === 'false') {
      where.complaint = null;
    }

    if (search) {
      where.OR = [
        { protocol: { contains: search } },
        { comment: { contains: search } },
      ];
    }

    if (period) {
      const now = new Date();
      if (period === 'hoje') {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        where.createdAt = { gte: startOfToday };
      } else if (period === '7dias') {
        where.createdAt = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      } else if (period === '30dias') {
        where.createdAt = { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
      }
    }

    const [total, reviews] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          table: {
            select: { id: true, number: true, name: true },
          },
          complaint: {
            select: {
              id: true,
              protocol: true,
              status: true,
              category: true,
              customerName: true,
              customerPhone: true,
              requestContact: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Erro ao listar avaliações:', error);
    return NextResponse.json({ error: 'Erro ao buscar avaliações' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json({ error: 'ID da avaliação não informado' }, { status: 400 });
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { viewedByStaff: true },
    });

    return NextResponse.json({ success: true, review: updated });
  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error);
    return NextResponse.json({ error: 'Erro ao atualizar avaliação' }, { status: 500 });
  }
}
