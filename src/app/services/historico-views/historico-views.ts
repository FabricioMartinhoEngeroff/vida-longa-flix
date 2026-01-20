import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HistoricoViewsService {
  private storageKey(email: string) {
    return `vida-longa-flix:views:${email}`;
  }

  registrarView(email: string, videoId: string): void {
    if (!email || !videoId) return;

    const key = this.storageKey(email);
    const data = this.getViews(email);

    data[videoId] = (data[videoId] || 0) + 1;

    localStorage.setItem(key, JSON.stringify(data));
  }

  getViews(email: string): Record<string, number> {
    const key = this.storageKey(email);
    const raw = localStorage.getItem(key);

    try {
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  getViewsDoVideo(email: string, videoId: string): number {
    const data = this.getViews(email);
    return data[videoId] || 0;
  }
}
