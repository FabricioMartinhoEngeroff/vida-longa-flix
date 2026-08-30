import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ApiService } from '../api/api.service';
import {
  User,
  RegisterData,
  ProfileData,
  LoginResponse,
  RegistrationResponse,
  RegistrationStatusResponse,
  WaitlistRemovalResponse,
} from '../types/user.types';
import { handleApiError } from '../utils/handle-api-error';
import { LoggerService } from './logger.service';
import { StorageService } from './storage.service';
import { mapLoginToApi, mapRegisterToApi, normalizeEmail } from '../utils/auth-mapper';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private router: Router,
    private logger: LoggerService,
    private storage: StorageService
  ) {
    this.loadSession();
  }

  private loadSession(): void {
    const user = this.storage.loadUser();
    if (user) this.userSubject.next(user);
  }

  private saveSession(user: User, type: 'local' | 'session'): void {
    this.storage.saveUser(user, type === 'local');
    this.userSubject.next(user);
  }

  private clearSession(): void {
    this.storage.clearUser();
    this.userSubject.next(null);
  }

  async login(email: string, password: string, keepLoggedIn = true): Promise<LoginResponse> {
    try {
      const payload = mapLoginToApi(email, password, keepLoggedIn);

      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.api.baseURL}/auth/login`, payload)
      );

      if (!response?.token) {
        throw new Error('Token not returned by API');
      }

      const user: User = response.user || {
        id: '',
        name: '',
        email: payload.email,
        phone: '',
        taxId: '',
        address: undefined,
        photo: null,
        profileComplete: true,
      };

      this.saveSession(user, keepLoggedIn ? 'local' : 'session');
      return response;
    } catch (error) {
      throw handleApiError(error, 'Erro ao fazer login');
    }
  }

  async register(data: RegisterData): Promise<RegistrationResponse> {
    try {
      const payload = mapRegisterToApi(data);

      const response = await firstValueFrom(
        this.http.post<RegistrationResponse>(`${this.api.baseURL}/auth/register`, payload)
      );

      if (response?.queued) {
        return response;
      }

      if (!response?.token) {
        throw new Error('Token not returned by API');
      }

      const user: User = response.user || {
        id: '',
        name: payload.name,
        email: payload.email,
        phone: data.phone,
        taxId: '',
        address: undefined,
        photo: null,
        profileComplete: false,
        roles: []
      };

      this.saveSession(user, 'local');
      return response;

    } catch (error) {
      throw handleApiError(error, 'Erro ao registrar usuário');
    }
  }

  async getRegistrationStatus(): Promise<RegistrationStatusResponse> {
    return firstValueFrom(
      this.http.get<RegistrationStatusResponse>(`${this.api.baseURL}/auth/registration-status`)
    );
  }

  async leaveWaitlist(email: string): Promise<WaitlistRemovalResponse> {
    const normalizedEmail = normalizeEmail(email);

    return firstValueFrom(
      this.http.delete<WaitlistRemovalResponse>(
        `${this.api.baseURL}/auth/waitlist/me?email=${encodeURIComponent(normalizedEmail)}`
      )
    );
  }

  async fetchAuthenticatedUser(): Promise<User | null> {
    if (!this.isAuthenticated()) {
      this.router.navigateByUrl('/login');
      return null;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<User>(`${this.api.baseURL}/users/me`)
      );

      if (response) {
        this.saveSession(response, this.storage.isPersistent() ? 'local' : 'session');
      }

      return response ?? null;
    } catch (error) {
      this.logger.error('Error fetching authenticated user:', error);
      return null;
    }
  }

  async updateProfile(data: ProfileData): Promise<User> {
    const currentUser = this.user;
    if (!currentUser) throw new Error('User not authenticated');

    const updatedUser: User = {
      ...currentUser,
      name: data.name,
      email: data.email,
      taxId: data.taxId || '',
      phone: data.phone || '',
      address: data.address,
      profileComplete: true,
      updatedAt: new Date()
    };

    this.saveSession(updatedUser, this.storage.isPersistent() ? 'local' : 'session');
    return updatedUser;
  }

  async updatePhoto(photo: string | null): Promise<void> {
    const currentUser = this.user;
    if (!currentUser) throw new Error('User not authenticated');

    const updatedUser: User = {
      ...currentUser,
      photo,
      updatedAt: new Date()
    };

    this.saveSession(updatedUser, this.storage.isPersistent() ? 'local' : 'session');
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.api.baseURL}/auth/logout`, {})
      );
    } catch {
    } finally {
      this.clearSession();
      this.router.navigate(['/authorization']);
    }
  }

  
  handleSessionExpired(): void {
    if (!this.isAuthenticated()) return;
    this.clearSession();
    this.router.navigate(['/authorization']);
  }

  get user(): User | null {
    return this.userSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.user;
  }
}