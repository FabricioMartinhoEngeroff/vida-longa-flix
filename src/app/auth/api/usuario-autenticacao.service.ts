import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

import { ApiService } from './api.service';
import { ServicoAutenticacao } from './servico-autenticacao';
import { Usuario } from '../tipos/usuario';

@Injectable({ providedIn: 'root' })
export class UsuarioAutenticacaoService {
  constructor(
    private http: HttpClient,
    private api: ApiService,
    private auth: ServicoAutenticacao,
    private router: Router
  ) {}

  async fetchAuthenticatedUser(): Promise<Usuario | null> {
    const token = this.auth.getToken();
    if (token === 'token_dev_123') {
      return {
        id: '1',
        nome: 'Fabricio (DEV)',
        email: 'fa.engeroff@gmail.com',
        telefone: '',
        cpf: '',
        endereco: { rua: '', bairro: '', cidade: '', estado: '', cep: '' },
      };
    }

    if (!token) {
      alert('Sessão expirada. Faça login novamente.');
      this.router.navigateByUrl('/login');
      return null;
    }

    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      const response = await firstValueFrom(
        this.http.get<Usuario>(`${this.api.baseURL}/users/me`, { headers })
      );

      return response ?? null;
    } catch (error) {
      alert('Erro ao buscar usuário autenticado.');
      return null;
    }
  }

  logout() {
    // Limpa dados do usuário
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    // Redireciona para login
    this.router.navigate(['/autorizacao']);
  }
}