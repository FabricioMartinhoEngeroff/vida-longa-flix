import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ViewHistoryService {
 
  private storageKey(email: string): string {
    return `vida-longa-flix:views:${email}`;
  }

  registerView(email: string, videoId: string): void {
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

  getVideoViews(email: string, videoId: string): number {
    const data = this.getViews(email);
    return data[videoId] || 0;
  }

  clearHistory(email: string): void {
    const key = this.storageKey(email);
    localStorage.removeItem(key);
  }


  getMostWatchedVideos(email: string, limit: number = 10): string[] {
    const data = this.getViews(email);
    
    return Object.entries(data)
      .sort(([, viewsA], [, viewsB]) => viewsB - viewsA)
      .slice(0, limit)
      .map(([videoId]) => videoId);
  }
}