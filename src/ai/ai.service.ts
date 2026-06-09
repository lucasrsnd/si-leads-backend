import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import axios from "axios";

export interface ChatMessageDto {
  message: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

@Injectable()
export class AiService {
  private readonly aiUrl: string;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.aiUrl = this.config.get<string>(
      "AI_SERVICE_URL",
      "http://localhost:8000",
    );
  }

  private async buildLeadsContext(): Promise<string> {
    try {
      const [total, byStatus, recent] = await Promise.all([
        this.prisma.lead.count(),
        this.prisma.lead.groupBy({ by: ["status"], _count: { id: true } }),
        this.prisma.lead.findMany({
          take: 5,
          orderBy: { updatedAt: "desc" },
          select: { name: true, status: true, priority: true, source: true },
        }),
      ]);

      const statusSummary = byStatus
        .map((s) => `${s.status}: ${s._count.id}`)
        .join(", ");
      const recentStr = recent
        .map((l) => `${l.name} (${l.status}, prioridade ${l.priority})`)
        .join("; ");

      return `\n\nDADOS ATUAIS DO SISTEMA:\n- Total de leads: ${total}\n- Por status: ${statusSummary}\n- Leads recentes: ${recentStr}`;
    } catch {
      return "";
    }
  }

  async chat(dto: ChatMessageDto, userId: string) {
    try {
      const leadsContext = await this.buildLeadsContext();

      const response = await axios.post(
        `${this.aiUrl}/chat`,
        {
          message: dto.message,
          history: dto.history || [],
          user_id: userId,
          leads_context: leadsContext,
        },
        { timeout: 30000 },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error.response?.data?.detail ||
            "Erro ao comunicar com o serviço de IA",
          error.response?.status || HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      throw new HttpException(
        "Serviço de IA indisponível",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async health() {
    try {
      const res = await axios.get(`${this.aiUrl}/health`, { timeout: 5000 });
      return res.data;
    } catch {
      return { status: "offline" };
    }
  }
}
