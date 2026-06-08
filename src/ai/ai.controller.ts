import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class ChatDto {
  @ApiProperty({ example: 'Quantos leads temos no status NOVO?' })
  @IsString()
  message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  history?: { role: 'user' | 'assistant'; content: string }[];
}

@ApiTags('AI ChatBot')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private ai: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Enviar mensagem para o ChatBot imobiliário' })
  chat(@Body() dto: ChatDto, @Request() req: any) {
    return this.ai.chat(dto, req.user.id);
  }

  @Get('health')
  @ApiOperation({ summary: 'Status do microsserviço de IA' })
  health() {
    return this.ai.health();
  }
}
