import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Usuario } from '../tipos/usuario'; // ajusta se teu caminho for outro

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'token';

  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  usuario$ = this.usuarioSubject.asObservable();

  get usuario(): Usuario | null {
    return this.usuarioSubject.value;
  }

  async login(email: string, senha: string): Promise<void> {
    const data = await this.authLogin(email, senha);

    if (data?.token) {
      localStorage.setItem(this.TOKEN_KEY, data.token);

      try {
        const userData = await this.fetchAuthenticatedUser();
        if (userData) {
          this.usuarioSubject.next(userData);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.usuarioSubject.next(null);
  }

  // ======================================================
  // ✅ AQUI são os equivalentes dos teus services do React
  // ======================================================

  private async authLogin(email: string, senha: string): Promise<{ token: string } | null> {
    // TODO: substituir por HttpClient (endpoint real)
    // return this.http.post<{token: string}>(`${API}/auth/login`, { email, senha }).toPromise();

    return { token: 'token_fake' };
  }

  private async fetchAuthenticatedUser(): Promise<Usuario | null> {
    // TODO: substituir por HttpClient (endpoint real)
    // return this.http.get<Usuario>(`${API}/users/me`).toPromise();

    return {
      id: '1',
      nome: 'Usuário Teste',
      telefone: '',
      cpf: '',
      endereco: { rua: '', bairro: '', cidade: '', estado: '', cep: '' },
    };
  }
}
