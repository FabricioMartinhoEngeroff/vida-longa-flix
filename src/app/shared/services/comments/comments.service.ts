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

  // mensagem de erro da ultima escrita (POST/DELETE); null quando tudo ok
  private errorState = signal<string | null>(null);

  // cancela GET anterior para evitar resposta stale sobrescrever dados frescos
  private loadSub: Record<string, Subscription> = {};

  readonly comments = this.state.asReadonly();
  readonly error = this.errorState.asReadonly();

  constructor(private http: HttpClient) {}

  clearError(): void {
    this.errorState.set(null);
  }

  loadByVideo(videoId: string): void {
    const key = `video:${videoId}`;
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
    return this.state()[`video:${videoId}`] ?? [];
  }

  add(videoId: string, text: string): void {
    const txt = (text ?? '').trim();
    if (!txt) return;

    this.errorState.set(null); // nova tentativa zera erro anterior

    this.http.post<void>(this.baseUrl, { text, videoId })
      .subscribe({
        next: () => this.loadByVideo(videoId),
        error: () => this.errorState.set('Não foi possível publicar seu comentário. Tente novamente.')
      });
  }

  delete(commentId: string, videoId: string): void {
    this.errorState.set(null);

    this.http.delete<void>(`${this.baseUrl}/${commentId}`)
      .subscribe({
        next: () => this.loadByVideo(videoId),
        error: () => this.errorState.set('Não foi possível excluir o comentário. Tente novamente.')
      });
  }

  readonly totalComments = computed(() =>
    Object.values(this.state()).reduce((total, list) => total + list.length, 0)
  );
}
