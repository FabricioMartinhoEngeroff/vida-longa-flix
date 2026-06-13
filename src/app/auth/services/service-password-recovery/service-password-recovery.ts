import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../api/api.service';
import { LoggerService } from '../logger.service';


@Injectable({ providedIn: 'root' })
export class PasswordRecoveryService {


  constructor(
    private http: HttpClient,
    private api: ApiService,
    private logger: LoggerService
  ) { }

  async sendRecoveryEmail(email: string): Promise<void> {

    const normalizedEmail = (email ?? '').trim().toLowerCase();

    if (!normalizedEmail) {
      throw new Error('Email is required for password recovery');
    }

    try {
      await firstValueFrom(
        this.http.post<void>(`${this.api.baseURL}/auth/password-recovery`, {
          email: normalizedEmail,
        })
      );
    } catch (error) {
      this.logger.error('Error sending recovery email:', error);
      throw new Error('Failed to send recovery email');
    }
  }

  async validateToken(token: string): Promise<boolean> {
    if (!token) return false;

    try {
      await firstValueFrom(
        this.http.get<void>(`${this.api.baseURL}/auth/validate-token`, {
          params: { token },
        })
      );
      return true;

    } catch (error) {

      if (error instanceof HttpErrorResponse) {
        if (error.status === 404 || error.status === 410) {
          return false;
        }
      }

      throw error;
    }
  }


  async changePassword(token: string, newPassword: string): Promise<void> {
    // Guard: validação local antes de ir à rede.
    if (!token || !newPassword) {
      throw new Error('Token and new password are required');
    }

    await firstValueFrom(
      this.http.post<void>(`${this.api.baseURL}/auth/reset-password`, {
        token,
        newPassword,
      })
    );
  }


  async sendChangeConfirmation(email: string): Promise<void> {
    const normalizedEmail = (email ?? '').trim().toLowerCase();

    if (!normalizedEmail) return;

    try {
      await firstValueFrom(
        this.http.post<void>(`${this.api.baseURL}/auth/password-change/notify`, {
          email: normalizedEmail,
        })
      );
    } catch (error) {

      this.logger.warn('⚠️ Failed to send confirmation email:', error);
    }
  }
}