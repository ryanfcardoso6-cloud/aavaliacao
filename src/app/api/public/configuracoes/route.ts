import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const config = await prisma.storeConfig.findFirst({
      where: { id: 'default' },
      select: {
        storeName: true,
        logoUrl: true,
        description: true,
        welcomeMessage: true,
        subtitleMessage: true,
        thankYouPositive: true,
        thankYouNegative: true,
        phone: true,
        businessHours: true,
      },
    });

    return NextResponse.json(config || {
      storeName: 'Nossa Loja',
      welcomeMessage: 'Como foi sua experiência?',
      subtitleMessage: 'Sua opinião é importante para melhorarmos cada vez mais.',
    });
  } catch (error) {
    console.error('Erro ao buscar configurações públicas:', error);
    return NextResponse.json({
      storeName: 'Nossa Loja',
      welcomeMessage: 'Como foi sua experiência?',
      subtitleMessage: 'Sua opinião é importante para melhorarmos cada vez mais.',
    });
  }
}
