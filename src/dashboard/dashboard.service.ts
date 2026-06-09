import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMetrics() {
    const [
      totalLeads,
      byStatus,
      bySource,
      byPriority,
      recentLeads,
      recentActivities,
      conversionRate,
    ] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.lead.groupBy({ by: ["status"], _count: { id: true } }),
      this.prisma.lead.groupBy({ by: ["source"], _count: { id: true } }),
      this.prisma.lead.groupBy({ by: ["priority"], _count: { id: true } }),
      this.prisma.lead.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, status: true, createdAt: true },
      }),
      this.prisma.activity.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { lead: { select: { name: true } } },
      }),
      this.prisma.lead.count({ where: { status: "FECHADO" } }),
    ]);

    const closed = byStatus.find((s) => s.status === "FECHADO")?._count.id || 0;
    const lost = byStatus.find((s) => s.status === "PERDIDO")?._count.id || 0;

    return {
      totalLeads,
      conversionRate:
        totalLeads > 0 ? ((closed / totalLeads) * 100).toFixed(1) : "0",
      byStatus: Object.fromEntries(
        byStatus.map((s) => [s.status, s._count.id]),
      ),
      bySource: Object.fromEntries(
        bySource.map((s) => [s.source || "DESCONHECIDO", s._count.id]),
      ),
      byPriority: Object.fromEntries(
        byPriority.map((p) => [p.priority, p._count.id]),
      ),
      recentLeads,
      recentActivities,
    };
  }
}
