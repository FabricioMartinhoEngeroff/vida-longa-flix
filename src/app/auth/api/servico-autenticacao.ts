import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { ApiService } from './api.service';
import { DadosRegistro, LoginResponse } from '../tipos/usuario.types';


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
];

  constructor(
    private http: HttpClient,
    private api: ApiService
  ) {}

  async login(email: string, password: string): Promise<LoginResponse> {
 const e = (email ?? '').trim().toLowerCase();
const p = (password ?? '').trim();

const conta = this.CONTAS_MOCK.find(
  (u) => u.email.toLowerCase() === e && u.password === p
);

if (!conta) {
  throw new Error('Credenciais inválidas');
}

const token = conta.admin ? 'token_dev_admin_123' : 'token_dev_user_123';

localStorage.setItem(this.TOKEN_KEY, token);
localStorage.setItem(
  this.USER_KEY,
  JSON.stringify({
    id: conta.id,
    nome: conta.nome,
    email: conta.email,
    perfilCompleto: true,
  })
);

return { token } as LoginResponse;
}

  async register(userData: DadosRegistro): Promise<any> {
    const response = await firstValueFrom(
      this.http.post(`${this.api.baseURL}/auth/register`, userData)
    );

    return response;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
localStorage.removeItem(this.USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
