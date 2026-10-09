import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, canExportReports } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sanitizeCsvField } from '@/lib/security';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Atendentes NÃO possuem permissão para exportação global de dados
  if (!canExportReports(session.role)) {
    return NextResponse.json(
      { error: 'Apenas Administradores e Gerentes podem exportar relatórios' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'reviews'; // 'reviews' ou 'complaints'
    const limit = Math.min(5000, parseInt(searchParams.get('limit') || '1000'));

    let csvContent = '\uFEFF'; // UTF-8 BOM para garantir acentos corretos no Excel

    if (type === 'complaints') {
      const complaints = await prisma.complaint.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          review: {
            include: { table: true },
          },
          assignedTo: { select: { name: true, email: true } },
        },
      });

      const headers = [
        'Protocolo',
        'Data Criação',
        'Mesa',
        'Nota Avaliação',
        'Categoria',
        'Status',
        'Descrição',
        'Solicitou Retorno',
        'Nome Cliente',
        'Telefone Cliente',
        'Email Cliente',
        'Preferência Contato',
        'Responsável Atendimento',
        'Data Resolução',
      ];
      csvContent += headers.map(sanitizeCsvField).join(';') + '\r\n';

      for (const c of complaints) {
        const row = [
          c.protocol,
          new Date(c.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
          c.review?.table ? `Mesa ${c.review.table.number} - ${c.review.table.name}` : 'Sem Mesa',
          c.review?.rating || '',
          c.category,
          c.status,
          c.description,
          c.requestContact ? 'Sim' : 'Não',
          c.customerName || '',
          c.customerPhone || '',
          c.customerEmail || '',
          c.contactPreference || '',
          c.assignedTo?.name || 'Não atribuído',
          c.resolvedAt ? new Date(c.resolvedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : '',
        ];
        csvContent += row.map(sanitizeCsvField).join(';') + '\r\n';
      }
    } else {
      const reviews = await prisma.review.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          table: true,
          complaint: { select: { status: true, category: true } },
        },
      });

      const headers = [
        'Protocolo',
        'Data e Horário',
        'Nota (1-5)',
        'Mesa',
        'Comentário',
        'Possui Reclamação',
        'Categoria Reclamação',
        'Status Reclamação',
        'Visualizado pela Equipe',
      ];
      csvContent += headers.map(sanitizeCsvField).join(';') + '\r\n';

      for (const r of reviews) {
        const row = [
          r.protocol,
          new Date(r.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
          r.rating,
          r.table ? `Mesa ${r.table.number} - ${r.table.name}` : 'Sem Mesa',
          r.comment || '',
          r.complaint ? 'Sim' : 'Não',
          r.complaint?.category || '',
          r.complaint?.status || '',
          r.viewedByStaff ? 'Sim' : 'Não',
        ];
        csvContent += row.map(sanitizeCsvField).join(';') + '\r\n';
      }
    }

    // Registra auditoria da exportação
    await prisma.auditEvent.create({
      data: {
        userId: session.userId,
        action: 'EXPORTAR_RELATORIO',
        resource: 'EXPORT',
        details: `Exportação de ${type} (${limit} registros) realizada por ${session.name} (${session.role}).`,
      },
    });

    const filename = `relatorio-${type}-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    return NextResponse.json({ error: 'Erro ao gerar exportação de dados' }, { status: 500 });
  }
}
