import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, canManageStoreConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { storeConfigSchema } from '@/lib/validations';
import { sanitizeText } from '@/lib/security';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    let config = await prisma.storeConfig.findFirst({
      where: { id: 'default' },
    });

    if (!config) {
      config = await prisma.storeConfig.create({
        data: {
          id: 'default',
          storeName: 'Sabor & Arte Bistrô',
          description: 'Experiência gastronômica de excelência',
        },
      });
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  if (!canManageStoreConfig(session.role)) {
    return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parseResult = storeConfigSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    const updated = await prisma.storeConfig.upsert({
      where: { id: 'default' },
      update: {
        storeName: sanitizeText(data.storeName),
        logoUrl: data.logoUrl || null,
        description: data.description ? sanitizeText(data.description) : null,
        welcomeMessage: sanitizeText(data.welcomeMessage),
        subtitleMessage: sanitizeText(data.subtitleMessage),
        thankYouPositive: sanitizeText(data.thankYouPositive),
        thankYouNegative: sanitizeText(data.thankYouNegative),
        slaHours: data.slaHours,
        phone: data.phone ? sanitizeText(data.phone) : null,
        email: data.email ? sanitizeText(data.email) : null,
        address: data.address ? sanitizeText(data.address) : null,
        businessHours: data.businessHours ? sanitizeText(data.businessHours) : null,
      },
      create: {
        id: 'default',
        storeName: sanitizeText(data.storeName),
        logoUrl: data.logoUrl || null,
        description: data.description ? sanitizeText(data.description) : null,
        welcomeMessage: sanitizeText(data.welcomeMessage),
        subtitleMessage: sanitizeText(data.subtitleMessage),
        thankYouPositive: sanitizeText(data.thankYouPositive),
        thankYouNegative: sanitizeText(data.thankYouNegative),
        slaHours: data.slaHours,
        phone: data.phone ? sanitizeText(data.phone) : null,
        email: data.email ? sanitizeText(data.email) : null,
        address: data.address ? sanitizeText(data.address) : null,
        businessHours: data.businessHours ? sanitizeText(data.businessHours) : null,
      },
    });

    await prisma.auditEvent.create({
      data: {
        userId: session.userId,
        action: 'ATUALIZAR_CONFIGURACOES',
        resource: 'STORE_CONFIG',
        resourceId: 'default',
        details: `Configurações da loja atualizadas por ${session.name}.`,
      },
    });

    return NextResponse.json({ success: true, config: updated });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return NextResponse.json({ error: 'Erro ao atualizar configurações' }, { status: 500 });
  }
}
