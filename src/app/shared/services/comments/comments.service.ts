import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CommentResponse {
  id: string;
  text: string;
  date: string;
  user: { id: string; name: string };
}

@Injectable({ providedIn: 'root' })
export class CommentsService {

  private readonly baseUrl = `${environment.apiUrl}/comments`;

  // estado local por videoId
  private state = signal<Record<string, CommentResponse[]>>({});

  // cancela GET anterior para evitar resposta stale sobrescrever dados frescos
  private loadSub: Record<string, Subscription> = {};

  readonly comments = this.state.asReadonly();

  constructor(private http: HttpClient) {}

  loadByVideo(videoId: string): void {
    const key = this.getKey(videoId);
    this.loadSub[key]?.unsubscribe();

    this.loadSub[key] = this.http.get<CommentResponse[]>(`${this.baseUrl}/video/${videoId}`)
      .subscribe({
        next: (list) => this.state.update(current => ({
          ...current,
          [key]: list
        })),
        error: () => { /* noop: silencia 404 quando não há comentários */ }
      });
  }

  get(videoId: string): CommentResponse[] {
    return this.state()[this.getKey(videoId)] ?? [];
  }

  add(videoId: string, text: string): void {
    const txt = (text ?? '').trim();
    if (!txt) return;

    this.http.post<CommentResponse | null>(this.baseUrl, { text: txt, videoId })
      .subscribe({
        next: (created) => {
          this.state.update(current => ({
            ...current,
            [this.getKey(videoId)]: [...(current[this.getKey(videoId)] ?? []), this.toLocalComment(txt, created)]
          }));
        },
        error: () => { /* silencia erro de POST */ }
      });
  }

  delete(commentId: string, videoId: string): void {
    this.http.delete<void>(`${this.baseUrl}/${commentId}`)
      .subscribe({
        next: () => {
          this.state.update(current => ({
            ...current,
            [this.getKey(videoId)]: (current[this.getKey(videoId)] ?? []).filter((comment) => comment.id !== commentId)
          }));
        },
        error: () => { /* silencia erro de DELETE */ }
      });
  }

  private getKey(videoId: string): string {
    return `video:${videoId}`;
  }

  private toLocalComment(text: string, created: CommentResponse | null): CommentResponse {
    if (created?.id) {
      return created;
    }

    return {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      date: new Date().toISOString(),
      user: { id: 'local', name: 'Você' },
    };
  }

  readonly totalComments = computed(() =>
    Object.values(this.state()).reduce((total, list) => total + list.length, 0)
  );
}
