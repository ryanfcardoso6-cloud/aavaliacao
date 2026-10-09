import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { internalNoteSchema } from '@/lib/validations';
import { sanitizeText } from '@/lib/security';

export async function POST(
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
    const parseResult = internalNoteSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Nota inválida', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { content } = parseResult.data;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Reclamação não encontrada' }, { status: 404 });
    }

    const sanitizedContent = sanitizeText(content);

    const note = await prisma.$transaction(async (tx) => {
      const createdNote = await tx.internalNote.create({
        data: {
          complaintId: id,
          userId: session.userId,
          content: sanitizedContent,
        },
        include: {
          user: { select: { id: true, name: true, role: true } },
        },
      });

      await tx.complaintHistory.create({
        data: {
          complaintId: id,
          userId: session.userId,
          userName: session.name,
          action: 'NOTA_ADICIONADA',
          details: `Observação interna registrada por ${session.name}.`,
        },
      });

      return createdNote;
    });

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error('Erro ao adicionar nota interna:', error);
    return NextResponse.json({ error: 'Erro ao registrar observação' }, { status: 500 });
  }
}
