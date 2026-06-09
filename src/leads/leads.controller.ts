import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Request,
  Res,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Response } from "express";
import { LeadStatus } from "@prisma/client";
import { LeadsService } from "./leads.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { UpdateLeadDto } from "./dto/update-lead.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Leads")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("leads")
export class LeadsController {
  constructor(private leads: LeadsService) {}

  @Get()
  @ApiOperation({ summary: "Listar leads com filtros e paginação" })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "status", required: false, enum: LeadStatus })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  findAll(
    @Query("search") search?: string,
    @Query("status") status?: LeadStatus,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.leads.findAll({ search, status, page, limit });
  }

  @Get("kanban")
  @ApiOperation({ summary: "Retorna leads agrupados por status (Kanban)" })
  kanban() {
    return this.leads.getKanban();
  }

  @Get("export/csv")
  @ApiOperation({ summary: "Exportar leads em CSV" })
  async exportCsv(@Res() res: Response) {
    const csv = await this.leads.exportCsv();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=leads.csv");
    res.status(HttpStatus.OK).send(csv);
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar lead por ID" })
  findOne(@Param("id") id: string) {
    return this.leads.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Criar novo lead" })
  create(@Body() dto: CreateLeadDto, @Request() req: any) {
    return this.leads.create(dto, req.user.id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualizar lead" })
  update(
    @Param("id") id: string,
    @Body() dto: UpdateLeadDto,
    @Request() req: any,
  ) {
    return this.leads.update(id, dto, req.user.id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Deletar lead" })
  remove(@Param("id") id: string) {
    return this.leads.remove(id);
  }
}
