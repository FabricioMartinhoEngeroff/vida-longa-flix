import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';
import { Video, VideoRequest } from '../../types/videos';

import { environment } from '../../../../environments/environment';
import { LoggerService } from '../../../auth/services/logger.service';
import { FavoritesService } from '../favorites/favorites.service.';

@Injectable({ providedIn: 'root' })
export class VideoService {

  private readonly baseUrl = `${environment.apiUrl}/videos`;
  private videosSignal = signal<Video[]>([]);

  readonly videos = this.videosSignal.asReadonly();
  readonly totalVideos = computed(() => this.videosSignal().length);
  readonly totalLikes = computed(() =>
    this.videosSignal().reduce((sum, v) => sum + (v.likesCount ?? 0), 0)
  );

  constructor(
    private http: HttpClient,
    private favoritesService: FavoritesService,
    private logger: LoggerService
  ) {
    this.loadVideos();
  }

  loadVideos(): void {
    this.http.get<Video[]>(this.baseUrl).pipe(
      catchError(err => {
        this.logger.error('Erro ao carregar vídeos', err);
        return of([]);
      })
    ).subscribe(videos => {
      // Sincroniza favorited com o estado do FavoritesService
      const synced = videos.map(v => ({
        ...v,
        favorited: this.favoritesService.isFavorited(v.id, 'VIDEO'),
        likesCount: v.likesCount ?? 0
      }));
      this.videosSignal.set(synced);
    });
  }

  toggleFavorite(id: string): void {
    // Chama o backend via FavoritesService
    this.favoritesService.toggle(id, 'VIDEO');

    // Atualiza estado local otimisticamente
    this.videosSignal.update(current =>
      current.map(video => {
        if (video.id !== id) return video;
        const newFavorited = !video.favorited;
        return {
          ...video,
          favorited: newFavorited,
          likesCount: newFavorited
            ? (video.likesCount ?? 0) + 1
            : Math.max(0, (video.likesCount ?? 0) - 1)
        };
      })
    );
  }

  addVideo(request: VideoRequest): void {
    this.http.post<void>(this.baseUrl, request).pipe(
      tap(() => this.loadVideos()),
      catchError(err => {
        this.logger.error('Erro ao criar vídeo', err);
        return of(null);
      })
    ).subscribe();
  }

  removeVideo(id: string): void {
    this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.loadVideos()),
      catchError(err => {
        this.logger.error('Erro ao deletar vídeo', err);
        return of(null);
      })
    ).subscribe();
  }

  getVideoById(id: string): Video | undefined {
    return this.videosSignal().find(v => v.id === id);
  }

  getVideosByCategory(categoryId: string): Video[] {
    return this.videosSignal().filter(v => v.category.id === categoryId);
  }
}