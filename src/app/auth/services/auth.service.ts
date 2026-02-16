import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ApiService } from '../api/api.service';
import { WhatsAppService } from './whatsapp/whatsapp.service';
import { User, RegisterData, ProfileData } from '../types/user.types';
import { applyPhoneMaskAuto } from '../utils/masks.utils';
import { handleApiError } from '../utils/handle-api-error';

interface TokenResponse {
  token: string;
  user?: User;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  private readonly MOCK_ACCOUNTS = [
    {
      id: '1',
      name: 'Fabricio Engeroff',
      email: 'fa.engeroff@gmail.com',
      password: '@Fabricio123456789',
      admin: true,
    },
    {
      id: '2',
      name: 'Demo User',
      email: 'demo@vidalonga.com',
      password: '@Demo123456',
      admin: false,
    },
  ] as const;

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private router: Router,
    private whatsAppService: WhatsAppService
  ) {
    this.loadSession();
  }

  private loadSession() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userData = localStorage.getItem(this.USER_KEY);
    
    if (token && userData) {
      try {
        this.userSubject.next(JSON.parse(userData));
      } catch {
        this.clearSession();
      }
    }
  }

  async login(email: string, password: string): Promise<TokenResponse> {
    try {
      const payload = this.mapLoginToApi(email, password);
      
      // Check mock accounts first
      const mockAccount = this.MOCK_ACCOUNTS.find(
        (account) => account.email.toLowerCase() === payload.email && account.password === payload.password
      );

      if (mockAccount) {
        const token = mockAccount.admin ? 'token_dev_admin_123' : 'token_dev_user_123';
        const user: User = {
          id: mockAccount.id,
          name: mockAccount.name,
          email: mockAccount.email,
          phone: '',
          taxId: '',
          address: undefined,
          photo: null,
          profileComplete: true,
        };
        
        this.saveSession(token, user);
        return { token, user };
      }

      // Real API call
      const response = await firstValueFrom(
        this.http.post<TokenResponse>(`${this.api.baseURL}/auth/login`, payload)
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

      this.saveSession(response.token, user);
      return response;
    } catch (error) {
      throw handleApiError(error, 'Erro ao fazer login');
    }
  }

  async register(data: RegisterData): Promise<TokenResponse> {
    try {
      const payload = this.mapRegisterToApi(data);

      // Real API call
      const response = await firstValueFrom(
        this.http.post<TokenResponse>(`${this.api.baseURL}/auth/register`, payload)
      );

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
      };

      this.saveSession(response.token, user);

      // Send WhatsApp welcome message (don't block if it fails)
      try {
        await this.whatsAppService.sendWelcomeMessage({
          name: data.name,
          phone: data.phone
        });
      } catch (e) {
        console.warn('⚠️ WhatsApp not sent, but registration completed:', e);
      }

      return response;
    } catch (error) {
      throw handleApiError(error, 'Erro ao registrar usuário');
    }
  }

  async fetchAuthenticatedUser(): Promise<User | null> {
    const token = this.getToken();
    
    // Dev mode
    if (token === 'token_dev_admin_123' || token === 'token_dev_user_123') {
      return {
        id: '1',
        name: 'Fabricio (DEV)',
        email: 'fa.engeroff@gmail.com',
        phone: '',
        taxId: '',
        address: undefined,
        photo: null,
        profileComplete: false
      };
    }

    if (!token) {
      this.router.navigateByUrl('/login');
      return null;
    }

    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      const response = await firstValueFrom(
        this.http.get<User>(`${this.api.baseURL}/users/me`, { headers })
      );

      if (response) {
        this.userSubject.next(response);
      }

      return response ?? null;
    } catch (error) {
      console.error('Error fetching authenticated user:', error);
      return null;
    }
  }

  async updateProfile(data: ProfileData): Promise<User> {
    const currentUser = this.user;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // TODO: Call real backend
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

    const token = this.getToken() || 'fake_token_' + Date.now();
    this.saveSession(token, updatedUser);
    
    return updatedUser;
  }

  async updatePhoto(photo: string | null): Promise<void> {
    const currentUser = this.user;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const updatedUser: User = {
      ...currentUser,
      photo: photo,
      updatedAt: new Date()
    };

    const token = this.getToken() || 'fake_token_' + Date.now();
    this.saveSession(token, updatedUser);
  }

  logout() {
    this.clearSession();
    this.router.navigate(['/authorization']);
  }

  private saveSession(token: string, user: User) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.userSubject.next(user);
  }

  private clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
  }

  private mapLoginToApi(email: string, password: string): LoginPayload {
    return {
      email: (email ?? '').trim().toLowerCase(),
      password: (password ?? '').trim(),
    };
  }

  private mapRegisterToApi(data: RegisterData): RegisterPayload {
    return {
      name: (data.name ?? '').trim(),
      email: (data.email ?? '').trim().toLowerCase(),
      password: data.password ?? '',
      phone: applyPhoneMaskAuto(data.phone ?? ''),
    };
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  get user(): User | null {
    return this.userSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}