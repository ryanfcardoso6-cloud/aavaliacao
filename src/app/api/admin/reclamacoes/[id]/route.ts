import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { id } = params;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        review: {
          include: {
            table: true,
          },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, role: true } },
          },
        },
        history: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Reclamação não encontrada' }, { status: 404 });
    }

    // Marca a avaliação associada como visualizada pela equipe
    if (!complaint.review.viewedByStaff) {
      await prisma.review.update({
        where: { id: complaint.reviewId },
        data: { viewedByStaff: true },
      });
    }

    return NextResponse.json({ complaint });
  } catch (error) {
    console.error('Erro ao buscar detalhes da reclamação:', error);
    return NextResponse.json({ error: 'Erro ao buscar detalhes' }, { status: 500 });
  }
}
