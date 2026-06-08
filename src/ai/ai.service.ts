import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface ChatMessageDto {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

@Injectable()
export class AiService {
  private readonly aiUrl: string;

  constructor(private config: ConfigService) {
    this.aiUrl = this.config.get<string>('AI_SERVICE_URL', 'http://localhost:8000');
  }

  async chat(dto: ChatMessageDto, userId: string) {
    try {
      const response = await axios.post(
        `${this.aiUrl}/chat`,
        { message: dto.message, history: dto.history || [], user_id: userId },
        { timeout: 30000 },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error.response?.data?.detail || 'Erro ao comunicar com o serviço de IA',
          error.response?.status || HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      throw new HttpException('Serviço de IA indisponível', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async health() {
    try {
      const res = await axios.get(`${this.aiUrl}/health`, { timeout: 5000 });
      return res.data;
    } catch {
      return { status: 'offline' };
    }
  }
}
