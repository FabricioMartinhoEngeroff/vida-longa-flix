import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoggerService } from '../logger.service';

export interface WelcomeMessageData {
  name: string;
  phone: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080';

  constructor(private http: HttpClient, private logger: LoggerService) {}

  async sendWelcomeMessage(data: WelcomeMessageData): Promise<void> {
    this.logger.log('Enviando WhatsApp de boas-vindas para:', data.phone);
    
    try {
      const params = new URLSearchParams({
        name: data.name,
        phone: data.phone
      });

      const response = await firstValueFrom(
        this.http.post<string>(
          `${this.apiUrl}/public/onboarding?${params.toString()}`,
          null,
          { responseType: 'text' as 'json' }
        )
      );

      this.logger.log('WhatsApp enviado:', response);
    } catch (error) {
      this.logger.error('Erro ao enviar WhatsApp:', error);
      throw error;
    }
  }
}