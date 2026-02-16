import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../api/api.service';

@Injectable({ providedIn: 'root' })
export class PasswordRecoveryService {
  constructor(
    private http: HttpClient,
    private api: ApiService
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
      console.error('Error sending recovery email:', error);
      throw new Error('Failed to send recovery email');
    }
  }

  async validateToken(token: string): Promise<boolean> {
    console.log('🔍 Validating token:', token);
    
    if (!token) return false;

    try {
      // TODO: Implement real backend call when available
      // const response = await firstValueFrom(
      //   this.http.get<{ valid: boolean }>(`${this.api.baseURL}/auth/validate-token/${token}`)
      // );
      // return response.valid;

      // Mock: accepts any token for now
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  async changePassword(token: string, newPassword: string): Promise<void> {
    console.log('🔐 Changing password with token');
    
    if (!token || !newPassword) {
      throw new Error('Token and new password are required');
    }

    try {
      // TODO: Implement real backend call when available
      // await firstValueFrom(
      //   this.http.post<void>(`${this.api.baseURL}/auth/reset-password`, {
      //     token,
      //     newPassword
      //   })
      // );

      // Mock: simulates backend delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Password changed successfully');
    } catch (error) {
      console.error('Password change error:', error);
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
      console.warn('⚠️ Failed to send confirmation email:', error);
    }
  }
}