import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {
  // 👇 define tua baseURL aqui ou no environment
  readonly baseURL = 'http://localhost:8080';
}
