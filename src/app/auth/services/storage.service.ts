import { Injectable } from '@angular/core';
import { User } from '../types/user.types';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly USER_KEY = 'user';
  private readonly TOKEN_KEY = 'token';

  saveUser(user: User, persistent: boolean): void {
    const primary = persistent ? localStorage : sessionStorage;
    const secondary = persistent ? sessionStorage : localStorage;

    primary.setItem(this.USER_KEY, JSON.stringify(user));
    secondary.removeItem(this.USER_KEY);

    primary.removeItem(this.TOKEN_KEY);
    secondary.removeItem(this.TOKEN_KEY);
  }

  loadUser(): User | null {
    localStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);

    const raw = localStorage.getItem(this.USER_KEY)
             ?? sessionStorage.getItem(this.USER_KEY);

    if (!raw) return null;

    try {
      return JSON.parse(raw) as User;
    } catch {
      this.clearUser();
      return null;
    }
  }

  clearUser(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  isPersistent(): boolean {
    return !!localStorage.getItem(this.USER_KEY);
  }
}