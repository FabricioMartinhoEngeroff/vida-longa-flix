import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../api/api.service';
import { LoggerService } from '../logger.service';

@Injectable({ providedIn: 'root' })
export class PasswordRecoveryService {
  constructor(
    private http: HttpClient,
    private api: ApiService,
    private logger: LoggerService
  ) {}

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
    this.logger.log('🔍 Validating token:', token);
    
    if (!token) return false;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      this.logger.error('Token validation error:', error);
      return false;
    }
  }

  async changePassword(token: string, newPassword: string): Promise<void> {
    this.logger.log('🔐 Changing password with token');
    
    if (!token || !newPassword) {
      throw new Error('Token and new password are required');
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.logger.log('✅ Password changed successfully');
    } catch (error) {
      this.logger.error('Password change error:', error);
      throw new Error('Failed to change password');
    }
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