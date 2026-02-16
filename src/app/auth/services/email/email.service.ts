import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../api/api.service';

@Injectable({ providedIn: 'root' })
export class EmailService {
  constructor(
    private http: HttpClient,
    private api: ApiService
  ) {}

  async sendPasswordRecovery(email: string): Promise<void> {
    const normalizedEmail = (email ?? '').trim().toLowerCase();

    if (!normalizedEmail) {
      throw new Error('Email is required for password recovery.');
    }

    await firstValueFrom(
      this.http.post<void>(`${this.api.baseURL}/auth/password-recovery`, {
        email: normalizedEmail,
      })
    );
  }

  async sendPasswordChangeConfirmation(token: string): Promise<void> {
    const normalizedToken = (token ?? '').trim();
    if (!normalizedToken) return;

    await firstValueFrom(
      this.http.post<void>(`${this.api.baseURL}/auth/password-change/notify`, {
        token: normalizedToken,
      })
    );
  }

  async enviarRecuperacaoSenha(email: string): Promise<void> {
    // PT-BR: alias temporário para não quebrar o código legado.
    return this.sendPasswordRecovery(email);
  }

  async enviarConfirmacaoTrocaSenha(token: string): Promise<void> {
    // PT-BR: alias temporário para não quebrar o código legado.
    return this.sendPasswordChangeConfirmation(token);
  }
}
