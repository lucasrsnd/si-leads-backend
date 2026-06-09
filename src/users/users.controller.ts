import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  @ApiOperation({ summary: "Listar todos os usuários" })
  findAll() {
    return this.users.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar usuário por ID" })
  findOne(@Param("id") id: string) {
    return this.users.findOne(id);
  }
}
