import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { generateProtocol } from '../src/lib/protocol';

describe('Integração com Banco de Dados e Ciclo de Vida da Reclamação', () => {
  let testTableId: string;
  let testReviewId: string;
  let testComplaintId: string;

  beforeAll(async () => {
    // Garante que o banco está acessível e cria mesa de teste
    const table = await prisma.table.upsert({
      where: { number: 999 },
      update: {},
      create: {
        number: 999,
        name: 'Mesa de Teste Automatizado',
        slug: 'mesa-999',
        token: 'token_teste_999',
        active: true,
      },
    });
    testTableId = table.id;
  });

  afterAll(async () => {
    // Limpeza dos dados de teste
    if (testComplaintId) {
      await prisma.complaint.delete({ where: { id: testComplaintId } }).catch(() => {});
    }
    if (testReviewId) {
      await prisma.review.delete({ where: { id: testReviewId } }).catch(() => {});
    }
    if (testTableId) {
      await prisma.table.delete({ where: { id: testTableId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it('deve persistir uma avaliação vinculada à mesa', async () => {
    const protocol = generateProtocol('PRT');
    const review = await prisma.review.create({
      data: {
        rating: 2,
        comment: 'Comida fria e atendimento demorado no teste',
        tableId: testTableId,
        protocol: protocol,
      },
      include: { table: true },
    });

    testReviewId = review.id;
    expect(review.id).toBeDefined();
    expect(review.rating).toBe(2);
    expect(review.table?.number).toBe(999);
    expect(review.protocol).toBe(protocol);
  });

  it('deve persistir uma reclamação vinculada à avaliação e registrar histórico inicial', async () => {
    const review = await prisma.review.findUnique({ where: { id: testReviewId } });
    expect(review).not.toBeNull();

    const complaint = await prisma.complaint.create({
      data: {
        reviewId: testReviewId,
        protocol: review!.protocol,
        category: 'QUALIDADE',
        description: 'A comida foi servida fria durante o almoço.',
        status: 'NOVA',
        customerName: 'Cliente Testador',
        customerPhone: '(11) 98888-7777',
        requestContact: true,
      },
    });

    testComplaintId = complaint.id;
    expect(complaint.id).toBeDefined();
    expect(complaint.status).toBe('NOVA');

    // Registra evento de histórico
    const history = await prisma.complaintHistory.create({
      data: {
        complaintId: complaint.id,
        action: 'CRIADA',
        details: 'Reclamação de teste registrada com sucesso.',
      },
    });

    expect(history.id).toBeDefined();
    expect(history.complaintId).toBe(complaint.id);
  });

  it('deve permitir adicionar nota interna privada do colaborador', async () => {
    const user = await prisma.user.findFirst();
    expect(user).not.toBeNull();

    const note = await prisma.internalNote.create({
      data: {
        complaintId: testComplaintId,
        userId: user!.id,
        content: 'Contato telefônico realizado com sucesso. Cliente compreensivo.',
      },
    });

    expect(note.id).toBeDefined();
    expect(note.content).toContain('Contato telefônico');
  });

  it('deve atualizar status para RESOLVIDA com registro no histórico de auditoria', async () => {
    const updated = await prisma.complaint.update({
      where: { id: testComplaintId },
      data: {
        status: 'RESOLVIDA',
        resolvedAt: new Date(),
      },
    });

    expect(updated.status).toBe('RESOLVIDA');
    expect(updated.resolvedAt).not.toBeNull();

    const history = await prisma.complaintHistory.create({
      data: {
        complaintId: testComplaintId,
        action: 'RESOLVIDA',
        details: 'Problema solucionado e aceito pelo cliente.',
        previousStatus: 'NOVA',
        newStatus: 'RESOLVIDA',
      },
    });

    expect(history.action).toBe('RESOLVIDA');

    // Valida que o histórico contém ambos os eventos
    const allHistory = await prisma.complaintHistory.findMany({
      where: { complaintId: testComplaintId },
    });
    expect(allHistory.length).toBeGreaterThanOrEqual(2);
  });
});
