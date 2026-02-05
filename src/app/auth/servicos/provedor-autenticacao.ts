import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Usuario } from '../tipos/usuario';

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
        if (userData) this.usuarioSubject.next(userData);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.usuarioSubject.next(null);
  }

  // ======= substitui pelos endpoints reais com HttpClient depois =======

  private async authLogin(email: string, senha: string): Promise<{ token: string } | null> {
    return { token: 'token_fake' };
  }

  private async fetchAuthenticatedUser(): Promise<Usuario | null> {
    return null;
  }
}
