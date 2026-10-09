import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, canExportReports } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30dias'; // '7dias', '30dias', '90dias', 'tudo'

    const now = new Date();
    let startDate: Date | undefined;

    if (period === '7dias') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === '30dias') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === '90dias') {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    const whereReview: any = startDate ? { createdAt: { gte: startDate } } : {};
    const whereComplaint: any = startDate ? { createdAt: { gte: startDate } } : {};

    const [
      reviews,
      complaints,
      resolvedComplaintsWithTime,
      tables,
    ] = await Promise.all([
      prisma.review.findMany({
        where: whereReview,
        select: { rating: true, createdAt: true, tableId: true },
      }),
      prisma.complaint.findMany({
        where: whereComplaint,
        select: {
          category: true,
          status: true,
          createdAt: true,
          resolvedAt: true,
          review: { select: { tableId: true } },
        },
      }),
      prisma.complaint.findMany({
        where: {
          status: 'RESOLVIDA',
          resolvedAt: { not: null },
          ...(startDate && { createdAt: { gte: startDate } }),
        },
        select: { createdAt: true, resolvedAt: true },
      }),
      prisma.table.findMany({
        select: { id: true, number: true, name: true },
      }),
    ]);

    const totalReviews = reviews.length;
    let sumRating = 0;
    let positiveReviews = 0;
    let negativeReviews = 0;
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const hourlyDistribution: Record<number, number> = {};

    for (let h = 0; h < 24; h++) hourlyDistribution[h] = 0;

    for (const r of reviews) {
      sumRating += r.rating;
      if (r.rating >= 4) positiveReviews++;
      if (r.rating <= 2) negativeReviews++;
      ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1;

      const hour = r.createdAt.getHours();
      hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
    }

    const averageRating = totalReviews > 0 ? (sumRating / totalReviews).toFixed(1) : '0.0';

    // Tempo médio de resolução em horas
    let totalResolutionHours = 0;
    for (const rc of resolvedComplaintsWithTime) {
      if (rc.resolvedAt) {
        const diffMs = rc.resolvedAt.getTime() - rc.createdAt.getTime();
        totalResolutionHours += diffMs / (1000 * 60 * 60);
      }
    }
    const avgResolutionTimeHours =
      resolvedComplaintsWithTime.length > 0
        ? (totalResolutionHours / resolvedComplaintsWithTime.length).toFixed(1)
        : '0';

    // Agrupamento de categorias
    const categoryCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = {};
    const tableComplaintCounts: Record<string, number> = {};

    for (const c of complaints) {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;

      const tid = c.review?.tableId;
      if (tid) {
        tableComplaintCounts[tid] = (tableComplaintCounts[tid] || 0) + 1;
      }
    }

    // Top mesas com mais reclamações
    const tableIdToName = new Map(tables.map((t) => [t.id, t.name]));
    const topTablesWithComplaints = Object.entries(tableComplaintCounts)
      .map(([tId, count]) => ({
        tableName: tableIdToName.get(tId) || 'Mesa não identificada',
        complaintsCount: count,
      }))
      .sort((a, b) => b.complaintsCount - a.complaintsCount)
      .slice(0, 5);

    return NextResponse.json({
      summary: {
        totalReviews,
        averageRating,
        positivePercentage: totalReviews > 0 ? Math.round((positiveReviews / totalReviews) * 100) : 0,
        negativePercentage: totalReviews > 0 ? Math.round((negativeReviews / totalReviews) * 100) : 0,
        totalComplaints: complaints.length,
        avgResolutionTimeHours,
      },
      ratingDistribution: Object.entries(ratingDistribution).map(([star, count]) => ({
        star: `${star} Estrelas`,
        quantidade: count,
      })),
      hourlyDistribution: Object.entries(hourlyDistribution).map(([hour, count]) => ({
        hour: `${String(hour).padStart(2, '0')}:00`,
        quantidade: count,
      })),
      categoryDistribution: Object.entries(categoryCounts).map(([cat, count]) => ({
        category: cat,
        quantidade: count,
      })),
      statusDistribution: Object.entries(statusCounts).map(([st, count]) => ({
        status: st,
        quantidade: count,
      })),
      topTablesWithComplaints,
    });
  } catch (error) {
    console.error('Erro ao gerar relatórios:', error);
    return NextResponse.json({ error: 'Erro ao gerar relatórios' }, { status: 500 });
  }
}
