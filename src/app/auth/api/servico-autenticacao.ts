import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { ApiService } from './api.service';
import { DadosRegistro } from '../tipos/usuario.types';
import { aplicarMascaraTelefoneAuto } from '../utils/mascaras.utils';

type TokenResponse = {
  token: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  telefone: string;
};

@Injectable({ providedIn: 'root' })
export class ServicoAutenticacao {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';
  private readonly CONTAS_MOCK = [
    {
      id: '1',
      nome: 'Fabricio Engeroff',
      email: 'fa.engeroff@gmail.com',
      password: '@Fabricio123456789',
      admin: true,
    },
    {
      id: '2',
      nome: 'Usuario Demo',
      email: 'demo@vidalonga.com',
      password: '@Demo123456',
      admin: false,
    },
  ] as const;

  constructor(
    private http: HttpClient,
    private api: ApiService
  ) {}

  async login(email: string, password: string): Promise<TokenResponse> {
    const payload = this.mapearLoginParaApi(email, password);
    const contaMock = this.CONTAS_MOCK.find(
      (conta) => conta.email.toLowerCase() === payload.email && conta.password === payload.password
    );

    if (contaMock) {
      const token = contaMock.admin ? 'token_dev_admin_123' : 'token_dev_user_123';
      this.salvarSessao(token, {
        id: contaMock.id,
        nome: contaMock.nome,
        email: contaMock.email,
        perfilCompleto: true,
      });
      return { token };
    }

    const response = await firstValueFrom(
      this.http.post<TokenResponse>(`${this.api.baseURL}/auth/login`, payload)
    );

    if (!response?.token) {
      throw new Error('Token não retornado pela API');
    }

    this.salvarSessao(response.token, { email: payload.email, perfilCompleto: true });
    return response;
  }

  async register(userData: DadosRegistro): Promise<TokenResponse> {
    const payload = this.mapearRegistroParaApi(userData);

    const response = await firstValueFrom(
      this.http.post<TokenResponse>(`${this.api.baseURL}/auth/register`, payload)
    );

    if (!response?.token) {
      throw new Error('Token não retornado pela API');
    }

    this.salvarSessao(response.token, {
      nome: payload.name,
      email: payload.email,
      telefone: payload.telefone,
      perfilCompleto: false,
    });

    return response;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private mapearLoginParaApi(email: string, password: string): LoginPayload {
    return {
      email: (email ?? '').trim().toLowerCase(),
      password: (password ?? '').trim(),
    };
  }

  private mapearRegistroParaApi(dados: DadosRegistro): RegisterPayload {
    return {
      name: (dados.nome ?? '').trim(),
      email: (dados.email ?? '').trim().toLowerCase(),
      password: dados.senha ?? '',
      telefone: aplicarMascaraTelefoneAuto(dados.telefone ?? ''),
    };
  }

  private salvarSessao(token: string, user: Record<string, unknown>): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
}
