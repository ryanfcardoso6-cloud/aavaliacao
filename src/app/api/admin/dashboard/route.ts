import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const storeConfig = await prisma.storeConfig.findFirst({
      where: { id: 'default' },
    });
    const slaHours = storeConfig?.slaHours || 24;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const slaThreshold = new Date(now.getTime() - slaHours * 60 * 60 * 1000);

    // Consultas agregadas simultâneas
    const [
      totalReviews,
      allRatings,
      reviewsToday,
      reviewsYesterday,
      newComplaintsCount,
      inProgressComplaintsCount,
      resolvedComplaintsCount,
      overdueComplaintsCount,
      complaintsByCategoryGroup,
      complaintsByStatusGroup,
      recentReviews,
      unviewedReviewsCount,
    ] = await Promise.all([
      prisma.review.count(),
      prisma.review.findMany({ select: { rating: true, createdAt: true } }),
      prisma.review.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.review.count({
        where: {
          createdAt: {
            gte: startOfYesterday,
            lt: startOfToday,
          },
        },
      }),
      prisma.complaint.count({ where: { status: 'NOVA' } }),
      prisma.complaint.count({ where: { status: 'EM_ATENDIMENTO' } }),
      prisma.complaint.count({ where: { status: 'RESOLVIDA' } }),
      prisma.complaint.count({
        where: {
          status: { in: ['NOVA', 'EM_ATENDIMENTO', 'AGUARDANDO_RETORNO'] },
          createdAt: { lt: slaThreshold },
        },
      }),
      prisma.complaint.groupBy({
        by: ['category'],
        _count: { category: true },
      }),
      prisma.complaint.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.review.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          table: { select: { name: true, number: true } },
          complaint: { select: { id: true, status: true, category: true } },
        },
      }),
      prisma.review.count({ where: { viewedByStaff: false } }),
    ]);

    // Cálculo da média de notas e percentuais
    let sumRatings = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (const r of allRatings) {
      sumRatings += r.rating;
      if (r.rating >= 4) positiveCount++;
      if (r.rating <= 2) negativeCount++;
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating]++;
      }
    }

    const averageRating = totalReviews > 0 ? (sumRatings / totalReviews).toFixed(1) : '0.0';
    const positivePercentage = totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0;
    const negativePercentage = totalReviews > 0 ? Math.round((negativeCount / totalReviews) * 100) : 0;

    // Tendência dos últimos 7 dias
    const last7Days: { date: string; reviews: number; complaints: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const dateLabel = dayStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      const dayReviews = allRatings.filter((r) => r.createdAt >= dayStart && r.createdAt <= dayEnd).length;
      last7Days.push({
        date: dateLabel,
        reviews: dayReviews,
        complaints: 0, // calculado abaixo
      });
    }

    // Contagem de reclamações nos 7 dias
    const recentComplaints = await prisma.complaint.findMany({
      where: {
        createdAt: {
          gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      select: { createdAt: true },
    });

    for (const c of recentComplaints) {
      const cDateLabel = c.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const item = last7Days.find((d) => d.date === cDateLabel);
      if (item) item.complaints++;
    }

    const totalComplaints = newComplaintsCount + inProgressComplaintsCount + resolvedComplaintsCount;
    const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaintsCount / totalComplaints) * 100) : 0;

    return NextResponse.json({
      kpis: {
        totalReviews,
        averageRating,
        positivePercentage,
        negativePercentage,
        reviewsToday,
        reviewsYesterday,
        unviewedReviewsCount,
        newComplaintsCount,
        inProgressComplaintsCount,
        resolvedComplaintsCount,
        overdueComplaintsCount,
        resolutionRate,
      },
      charts: {
        ratingDistribution: Object.entries(distribution).map(([star, count]) => ({
          star: `${star} ★`,
          quantidade: count,
        })),
        complaintsByCategory: complaintsByCategoryGroup.map((item) => ({
          category: item.category,
          total: item._count.category,
        })),
        complaintsByStatus: complaintsByStatusGroup.map((item) => ({
          status: item.status,
          total: item._count.status,
        })),
        last7Days,
      },
      recentReviews,
    });
  } catch (error) {
    console.error('Erro no dashboard:', error);
    return NextResponse.json({ error: 'Erro ao carregar dados do dashboard' }, { status: 500 });
  }
}
