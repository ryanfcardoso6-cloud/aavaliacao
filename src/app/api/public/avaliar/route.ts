import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { reviewSubmissionSchema } from '@/lib/validations';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { generateProtocol } from '@/lib/protocol';
import { sanitizeText } from '@/lib/security';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    // Rate limit para envio de avaliações: máximo de 10 envios por minuto por IP
    const rateCheck = checkRateLimit(`review:${ip}`, 10, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Você enviou muitas avaliações recentemente. Por favor, aguarde um minuto.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parseResult = reviewSubmissionSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos no envio', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Valida mesa, se informada
    let tableId: string | null = null;
    let tableName: string | null = null;
    if (data.tableToken) {
      const table = await prisma.table.findFirst({
        where: {
          OR: [{ token: data.tableToken }, { slug: data.tableToken }],
        },
      });

      if (table) {
        if (!table.active) {
          return NextResponse.json(
            { error: 'Esta mesa foi desativada e não está recebendo novas avaliações no momento.' },
            { status: 400 }
          );
        }
        tableId = table.id;
        tableName = table.name;
      }
    }

    // Gera protocolo imprevisível e hash do IP para proteção de privacidade
    const protocol = generateProtocol('PRT');
    const ipHash = crypto.createHash('sha256').update(ip + 'salt_2026').digest('hex').substring(0, 16);

    // Sanitiza comentários
    const sanitizedComment = data.comment ? sanitizeText(data.comment) : null;

    // Transação para gravar Review e eventual Complaint de forma atômica
    const result = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          rating: data.rating,
          comment: sanitizedComment,
          tableId: tableId,
          protocol: protocol,
          ipHash: ipHash,
          viewedByStaff: false,
        },
      });

      // Se a nota for baixa (1, 2 ou 3) ou houver detalhes de reclamação preenchidos
      if (data.complaint && data.complaint.description) {
        const c = data.complaint;
        const newComplaint = await tx.complaint.create({
          data: {
            reviewId: newReview.id,
            protocol: protocol,
            category: c.category,
            description: sanitizeText(c.description),
            status: 'NOVA',
            customerName: c.customerName ? sanitizeText(c.customerName) : null,
            customerPhone: c.customerPhone ? sanitizeText(c.customerPhone) : null,
            customerEmail: c.customerEmail ? sanitizeText(c.customerEmail) : null,
            contactPreference: c.contactPreference || 'NENHUM',
            requestContact: c.requestContact || false,
          },
        });

        // Registra histórico inicial
        await tx.complaintHistory.create({
          data: {
            complaintId: newComplaint.id,
            userName: 'Cliente (Área Pública)',
            action: 'CRIADA',
            details: `Reclamação registrada com protocolo ${protocol}.${tableName ? ` Mesa: ${tableName}.` : ''} Categoria: ${c.category}.`,
          },
        });
      }

      return newReview;
    });

    return NextResponse.json({
      success: true,
      protocol: result.protocol,
      rating: result.rating,
      message: 'Avaliação recebida com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao processar avaliação:', error);
    return NextResponse.json(
      { error: 'Não foi possível registrar seu feedback. Tente novamente em instantes.' },
      { status: 500 }
    );
  }
}
