import { Injectable, computed, signal } from '@angular/core';

export type ContentNotificationType = 'VIDEO' | 'MENU';

export interface ContentNotification {
  id: string;
  type: ContentNotificationType;
  title: string;
  createdAt: number;
  read: boolean;
  readAt?: number | null;
}

interface StoredPayload { version: 1; items: ContentNotification[] }

@Injectable({ providedIn: 'root' })
export class ContentNotificationsService {
  private readonly storageKey = 'vlflix:content-notifications:v1';
  private readonly maxItems = 200;

  private readonly state = signal<ContentNotification[]>(this.load());

  readonly notifications = this.state.asReadonly();
  readonly unreadCount = computed(() => this.state().filter((n) => !n.read).length);

  add(type: ContentNotificationType, title: string): void {
    const normalizedTitle = (title ?? '').trim();
    if (!normalizedTitle) return;

    const next: ContentNotification = {
      id: this.newId(),
      type,
      title: normalizedTitle,
      createdAt: Date.now(),
      read: false,
      readAt: null,
    };

    this.state.update((current) => {
      const updated = [next, ...current]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, this.maxItems);
      this.persist(updated);
      return updated;
    });
  }

  markRead(id: string): void {
    this.state.update((current) => {
      const updated = current.map((n) =>
        n.id === id && !n.read ? { ...n, read: true, readAt: Date.now() } : n
      );
      this.persist(updated);
      return updated;
    });
  }

  markAllRead(): void {
    this.state.update((current) => {
      if (!current.some((n) => !n.read)) return current;
      const now = Date.now();
      const updated = current.map((n) => (n.read ? n : { ...n, read: true, readAt: now }));
      this.persist(updated);
      return updated;
    });
  }

  clear(): void {
    this.state.set([]);
    this.persist([]);
  }

  private load(): ContentNotification[] {
    if (typeof window === 'undefined') return [];

    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];

      const parsed = JSON.parse(raw) as StoredPayload;
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.items)) return [];

      return parsed.items
        .filter((i) => i && typeof i.id === 'string' && typeof i.title === 'string')
        .map((i) => ({
          id: i.id,
          type: (i.type === 'MENU' ? 'MENU' : 'VIDEO') as ContentNotificationType,
          title: i.title,
          createdAt: typeof i.createdAt === 'number' ? i.createdAt : Date.now(),
          read: !!i.read,
          readAt: typeof i.readAt === 'number' ? i.readAt : null,
        }))
        .sort((a, b) => b.createdAt - a.createdAt);
    } catch {
      return [];
    }
  }

  private persist(items: ContentNotification[]): void {
    if (typeof window === 'undefined') return;
    try {
      const payload: StoredPayload = { version: 1, items };
      localStorage.setItem(this.storageKey, JSON.stringify(payload));
    } catch {
      // ignore storage failures (private mode, quota, etc.)
    }
  }

  private newId(): string {
    // crypto.randomUUID is available on modern browsers.
    const c = (globalThis as any).crypto;
    if (c?.randomUUID) return c.randomUUID();
    return `n_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  }
}
