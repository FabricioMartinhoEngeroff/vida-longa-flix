import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Usuario = {
  id: string;
  nome: string;
  email?: string;
};

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

  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLogado(): boolean {
    return !!this.token;
  }

  setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  setUsuario(usuario: Usuario | null) {
    this.usuarioSubject.next(usuario);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.usuarioSubject.next(null);
  }
}
