import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { ApiService } from './api.service';
import { DadosRegistro, LoginResponse } from '../tipos/usuario.types';


@Injectable({ providedIn: 'root' })
export class ServicoAutenticacao {
  private readonly TOKEN_KEY = 'token';

  constructor(
    private http: HttpClient,
    private api: ApiService
  ) {}

  async login(email: string, password: string): Promise<LoginResponse> {
  const e = (email ?? '').trim().toLowerCase();
  const p = (password ?? '').trim();

  if (e === 'fa.engeroff@gmail.com' && p === '@Fabricio123456789') {
    const responseFake = { token: 'token_dev_123' } as LoginResponse;
    localStorage.setItem(this.TOKEN_KEY, responseFake.token);
    return responseFake;
  }

  throw new Error('BYPASS ativo: use o e-mail e senha DEV.');
}


  async register(userData: DadosRegistro): Promise<any> {
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
