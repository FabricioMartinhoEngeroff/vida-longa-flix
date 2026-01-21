import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { ApiService } from './api.service';
import { DadosCadastroUsuario, LoginResponse } from '../tipos/tipos-autenticacao';

@Injectable({ providedIn: 'root' })
export class ServicoAutenticacao {
  private readonly TOKEN_KEY = 'token';

  constructor(
    private http: HttpClient,
    private api: ApiService
  ) {}

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${this.api.baseURL}/auth/login`, {
        email,
        password,
      })
    );

    if (!response?.token) {
      throw new Error('Token não retornado.');
    }

    localStorage.setItem(this.TOKEN_KEY, response.token);
    return response;
  }

  async register(userData: DadosCadastroUsuario): Promise<any> {
    const response = await firstValueFrom(
      this.http.post(`${this.api.baseURL}/auth/register`, userData)
    );

    return response;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
