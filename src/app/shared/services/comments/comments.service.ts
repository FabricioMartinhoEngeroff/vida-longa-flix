import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  readonly comments = this.state.asReadonly();

  constructor(private http: HttpClient) {}

  loadByVideo(videoId: string): void {
    this.http.get<CommentResponse[]>(`${this.baseUrl}/video/${videoId}`)
      .subscribe({
        next: (list) => this.state.update(current => ({
          ...current,
          [`video:${videoId}`]: list
        })),
        error: () => {} // silencia 404 quando não há comentários
      });
  }

  get(videoId: string): CommentResponse[] {
    return this.state()[`video:${videoId}`] ?? [];
  }

  add(videoId: string, text: string): void {
    const txt = (text ?? '').trim();
    if (!txt) return;

    this.http.post<void>(this.baseUrl, { text, videoId })
      .subscribe(() => this.loadByVideo(videoId));
  }

  delete(commentId: string, videoId: string): void {
    this.http.delete<void>(`${this.baseUrl}/${commentId}`)
      .subscribe(() => this.loadByVideo(videoId));
  }

  readonly totalComments = computed(() =>
    Object.values(this.state()).reduce((total, list) => total + list.length, 0)
  );
}