import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';

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
    const table = await prisma.table.findUnique({
      where: { id },
    });

    if (!table) {
      return NextResponse.json({ error: 'Mesa não encontrada' }, { status: 404 });
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    // A URL pública direciona para a página de avaliação com o token da mesa
    const targetUrl = `${baseUrl}/avaliar?mesa=${table.token}`;

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format'); // 'png' ou 'dataurl'

    if (format === 'png') {
      const qrBuffer = await QRCode.toBuffer(targetUrl, {
        width: 600,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });

      return new NextResponse(new Uint8Array(qrBuffer), {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="qrcode-mesa-${table.number}.png"`,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const dataUrl = await QRCode.toDataURL(targetUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });

    return NextResponse.json({
      table: {
        id: table.id,
        number: table.number,
        name: table.name,
        active: table.active,
      },
      url: targetUrl,
      qrCodeDataUrl: dataUrl,
    });
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    return NextResponse.json({ error: 'Erro ao gerar QR Code' }, { status: 500 });
  }
}
