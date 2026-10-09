import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { assignComplaintSchema } from '@/lib/validations';

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
    const parseResult = assignComplaintSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { assignedToId } = parseResult.data;

    let assigneeName = 'Nenhum (Não atribuído)';
    if (assignedToId) {
      const user = await prisma.user.findUnique({
        where: { id: assignedToId },
      });
      if (!user) {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
      }
      assigneeName = user.name;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const comp = await tx.complaint.update({
        where: { id },
        data: { assignedToId },
      });

      await tx.complaintHistory.create({
        data: {
          complaintId: id,
          userId: session.userId,
          userName: session.name,
          action: 'RESPONSAVEL_ATRIBUIDO',
          details: assignedToId
            ? `Atribuído para ${assigneeName} por ${session.name}.`
            : `Atribuição removida por ${session.name}.`,
        },
      });

      return comp;
    });

    return NextResponse.json({ success: true, complaint: updated });
  } catch (error) {
    console.error('Erro ao atribuir responsável:', error);
    return NextResponse.json({ error: 'Erro ao atribuir responsável' }, { status: 500 });
  }
}
