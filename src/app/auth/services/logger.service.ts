import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  log(message: string, ...args: any[]): void {
    if (!environment.production) {
      console.log(message, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (!environment.production) {
      console.error(message, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (!environment.production) {
      console.warn(message, ...args);
    }
  }
}