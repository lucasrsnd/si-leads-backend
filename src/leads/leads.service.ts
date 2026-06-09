import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { UpdateLeadDto } from "./dto/update-lead.dto";
import { LeadStatus } from "@prisma/client";

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    search?: string;
    status?: LeadStatus;
    myLeads?: boolean;
    userId?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, status, myLeads, userId, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (myLeads && userId) where.userId = userId;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          _count: { select: { activities: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        activities: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!lead) throw new NotFoundException(`Lead ${id} não encontrado`);
    return lead;
  }

  async create(dto: CreateLeadDto, createdById: string) {
    const lead = await this.prisma.lead.create({
      data: { ...dto },
      include: { assignedTo: { select: { id: true, name: true } } },
    });

    await this.prisma.activity.create({
      data: {
        leadId: lead.id,
        type: "CRIACAO",
        message: `Lead criado por ${createdById}`,
      },
    });

    return lead;
  }

  async update(id: string, dto: UpdateLeadDto, updatedById: string) {
    await this.findOne(id);
    const previous = await this.prisma.lead.findUnique({ where: { id } });

    const lead = await this.prisma.lead.update({
      where: { id },
      data: dto,
      include: { assignedTo: { select: { id: true, name: true } } },
    });

    if (dto.status && dto.status !== previous?.status) {
      await this.prisma.activity.create({
        data: {
          leadId: id,
          type: "STATUS",
          message: `Status alterado de ${previous?.status} para ${dto.status}`,
        },
      });
    }

    return lead;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.lead.delete({ where: { id } });
    return { message: "Lead removido com sucesso" };
  }

  async getKanban(myLeads?: boolean, userId?: string) {
    const where: any = {};
    if (myLeads && userId) where.userId = userId;

    const leads = await this.prisma.lead.findMany({
      where,
      include: { assignedTo: { select: { id: true, name: true } } },
      orderBy: { updatedAt: "desc" },
    });

    const columns: Record<string, any[]> = {
      NOVO: [],
      EM_CONTATO: [],
      QUALIFICADO: [],
      PROPOSTA: [],
      FECHADO: [],
      PERDIDO: [],
    };

    for (const lead of leads) {
      columns[lead.status].push(lead);
    }

    return columns;
  }

  async exportCsv() {
    const leads = await this.prisma.lead.findMany({
      include: { assignedTo: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    const header = [
      "Nome",
      "Email",
      "Telefone",
      "Status",
      "Fonte",
      "Prioridade",
      "Responsável",
      "Criado em",
    ];
    const rows = leads.map((l) => [
      l.name,
      l.email ?? "",
      l.phone ?? "",
      l.status,
      l.source ?? "",
      l.priority,
      l.assignedTo?.name ?? "",
      l.createdAt.toISOString().split("T")[0],
    ]);

    const bom = "\uFEFF";
    return bom + [header, ...rows].map((row) => row.join(";")).join("\n");
  }
}
