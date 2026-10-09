import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { statusUpdateSchema } from '@/lib/validations';
import { sanitizeText } from '@/lib/security';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await req.json();
    const parseResult = statusUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { status, note } = parseResult.data;

    const existing = await prisma.complaint.findUnique({
      where: { id },
      include: { review: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Reclamação não encontrada' }, { status: 404 });
    }

    const previousStatus = existing.status;
    if (previousStatus === status) {
      return NextResponse.json({ message: 'Status já atualizado', complaint: existing });
    }

    const isResolving = status === 'RESOLVIDA';

    // Transação atômica para atualizar status e gravar histórico
    const updated = await prisma.$transaction(async (tx) => {
      const complaintUpdated = await tx.complaint.update({
        where: { id },
        data: {
          status: status,
          resolvedAt: isResolving ? new Date() : existing.resolvedAt,
        },
      });

      // Cria registro de auditoria/histórico
      let details = `Status alterado de "${previousStatus}" para "${status}" por ${session.name}.`;
      if (note && note.trim()) {
        details += ` Justificativa: "${sanitizeText(note)}"`;
      }

      await tx.complaintHistory.create({
        data: {
          complaintId: id,
          userId: session.userId,
          userName: session.name,
          action: isResolving ? 'RESOLVIDA' : 'STATUS_ALTERADO',
          details: details,
          previousStatus: previousStatus,
          newStatus: status,
        },
      });

      return complaintUpdated;
    });

    return NextResponse.json({ success: true, complaint: updated });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return NextResponse.json({ error: 'Erro ao atualizar status' }, { status: 500 });
  }
}
