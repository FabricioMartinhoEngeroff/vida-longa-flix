import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface WelcomeMessageData {
  name: string;
  phone: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  async sendWelcomeMessage(data: WelcomeMessageData): Promise<void> {
    console.log('📱 Enviando WhatsApp de boas-vindas para:', data.phone);
    
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

      console.log('✅ WhatsApp enviado:', response);
    } catch (error) {
      console.error('❌ Erro ao enviar WhatsApp:', error);
      throw error;
    }
  }
}