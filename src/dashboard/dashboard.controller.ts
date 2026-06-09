import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Dashboard")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(private dashboard: DashboardService) {}

  @Get("metrics")
  @ApiOperation({ summary: "Métricas gerais do sistema" })
  getMetrics() {
    return this.dashboard.getMetrics();
  }
}
