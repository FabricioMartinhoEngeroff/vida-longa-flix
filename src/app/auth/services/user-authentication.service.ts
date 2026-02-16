import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ProfileData, RegisterData, User } from '../types/user.types';

@Injectable({
  providedIn: 'root'
})
export class UserAuthenticationService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private router: Router) {
    this.loadSession();
  }

  private loadSession() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userData = localStorage.getItem(this.USER_KEY);
    
    if (token && userData) {
      try {
        this.userSubject.next(JSON.parse(userData));
      } catch {
        this.clearSession();
      }
    }
  }


  async register(data: RegisterData): Promise<User> {
    const token = 'fake_token_' + Date.now();
    
    const user: User = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      taxId: '',
      phone: data.phone,
      address: undefined,
      photo: null,
      profileComplete: false,  
      createdAt: new Date()
    };

    this.saveSession(token, user);
    return user;
  }

  async login(email: string, password: string): Promise<User> {
  
    const token = 'fake_token_' + Date.now();
    
    const user: User = {
      id: '1',
      name: 'Fabricio Engeroff',
      email: email,
      taxId: '12345678900',
      phone: '51987654321',
      address: {
        street: 'Rua Exemplo',
        number: '123',
        neighborhood: 'Centro',
        city: 'Porto Alegre',
        state: 'RS',
        zipCode: '90000000'
      },
      photo: null,
      profileComplete: true,
      createdAt: new Date('2024-01-01')
    };

    this.saveSession(token, user);
    return user;
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

    const token = this.token || 'fake_token_' + Date.now();
    this.saveSession(token, updatedUser);
    
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

    const token = this.token || 'fake_token_' + Date.now();
    this.saveSession(token, updatedUser);
  }

  private saveSession(token: string, user: User) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.userSubject.next(user);
  }

  logout() {
    this.clearSession();
    this.router.navigate(['/authorization']);
  }

  private clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
  }

  get user(): User | null {
    return this.userSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}