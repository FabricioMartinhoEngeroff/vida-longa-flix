import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ApiService } from '../api/api.service';
import { User, RegisterData, ProfileData } from '../types/user.types';
import { removeMask } from '../utils/masks.utils';
import { handleApiError } from '../utils/handle-api-error';
import { LoggerService } from './logger.service';

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

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private router: Router,
    private logger: LoggerService
  ) {
    this.loadSession();
  }

  private loadSession() {
    // Prefer localStorage, fallback to sessionStorage (when user didn't choose "keep logged in").
    const localToken = localStorage.getItem(this.TOKEN_KEY);
    const localUser = localStorage.getItem(this.USER_KEY);
    const sessionToken = sessionStorage.getItem(this.TOKEN_KEY);
    const sessionUser = sessionStorage.getItem(this.USER_KEY);

    const token = localToken ?? sessionToken;
    const userData = localUser ?? sessionUser;

    if (token && userData) {
      try {
        this.userSubject.next(JSON.parse(userData));
      } catch {
        this.clearSession();
      }
    }
  }

  async login(email: string, password: string, keepLoggedIn = true): Promise<TokenResponse> {
    try {
      const payload = this.mapLoginToApi(email, password);

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

      this.saveSession(response.token, user, keepLoggedIn ? 'local' : 'session');
      return response;
    } catch (error) {
      throw handleApiError(error, 'Erro ao fazer login');
    }
  }

  async register(data: RegisterData): Promise<TokenResponse> {
  try {
    const payload = this.mapRegisterToApi(data);

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
      roles: []
    };

    this.saveSession(response.token, user, 'local');

    // WhatsApp removido daqui — backend já envia no /auth/register
    return response;

  } catch (error) {
    throw handleApiError(error, 'Erro ao registrar usuário');
  }
}

  async fetchAuthenticatedUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) {
      this.router.navigateByUrl('/login');
      return null;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<User>(`${this.api.baseURL}/users/me`)
      );

      if (response) {
        // Keep the same storage type already used by the session.
        const inLocal = !!localStorage.getItem(this.TOKEN_KEY);
        this.saveSession(token, response, inLocal ? 'local' : 'session');
      }

      return response ?? null;
    } catch (error) {
      this.logger.error('Error fetching authenticated user:', error);
      return null;
    }
  }

  async updateProfile(data: ProfileData): Promise<User> {
    const currentUser = this.user;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

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

    const token = this.getToken();
    if (!token) throw new Error('User not authenticated');
    const inLocal = !!localStorage.getItem(this.TOKEN_KEY);
    this.saveSession(token, updatedUser, inLocal ? 'local' : 'session');

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

    const token = this.getToken();
    if (!token) throw new Error('User not authenticated');
    const inLocal = !!localStorage.getItem(this.TOKEN_KEY);
    this.saveSession(token, updatedUser, inLocal ? 'local' : 'session');
  }

  logout() {
    this.clearSession();
    this.router.navigate(['/authorization']);
  }

  private saveSession(token: string, user: User, storage: 'local' | 'session') {
    const primary = storage === 'local' ? localStorage : sessionStorage;
    const secondary = storage === 'local' ? sessionStorage : localStorage;

    primary.setItem(this.TOKEN_KEY, token);
    primary.setItem(this.USER_KEY, JSON.stringify(user));

    // Ensure there's a single source of truth.
    secondary.removeItem(this.TOKEN_KEY);
    secondary.removeItem(this.USER_KEY);
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
      // Always send a canonical phone number (digits only) to the API.
      phone: removeMask(data.phone ?? ''),
    };
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) ?? sessionStorage.getItem(this.TOKEN_KEY);
  }

  get user(): User | null {
    return this.userSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
