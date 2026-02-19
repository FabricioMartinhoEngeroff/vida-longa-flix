import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';
import { Video, VideoRequest } from '../../types/videos';
import { FavoritesService } from '../favorites/favorites.service.';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
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
    private favoritesService: FavoritesService
  ) {
    this.loadVideos();
  }

  loadVideos(): void {
    this.http.get<Video[]>(this.baseUrl).pipe(
      catchError((err) => {
        console.error('Erro ao carregar vídeos', err);
        return of([]);
      })
    ).subscribe(videos => this.videosSignal.set(videos));
  }

  addVideo(request: VideoRequest): void {
    this.http.post<void>(this.baseUrl, request).pipe(
      tap(() => this.loadVideos()),
      catchError((err) => {
        console.error('Erro ao criar vídeo', err);
        return of(null);
      })
    ).subscribe();
  }

  removeVideo(id: string): void {
    this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.loadVideos()),
      catchError((err) => {
        console.error('Erro ao deletar vídeo', err);
        return of(null);
      })
    ).subscribe();
    this.favoritesService.removeFavorite(id);
  }

  toggleFavorite(id: string): void {
    this.videosSignal.update(current =>
      current.map(video => {
        if (video.id !== id) return video;
        const likesBase = video.likesCount ?? (video.favorited ? 1 : 0);
        const newFavorited = !video.favorited;
        const newLikes = newFavorited
          ? likesBase + 1
          : Math.max(0, likesBase - 1);
        const updated = { ...video, favorited: newFavorited, likesCount: newLikes };
        if (updated.favorited) {
          this.favoritesService.addFavorite(updated);
        } else {
          this.favoritesService.removeFavorite(updated.id);
        }
        return updated;
      })
    );
  }

  getVideoById(id: string): Video | undefined {
    return this.videosSignal().find(v => v.id === id);
  }

  getVideosByCategory(categoryId: string): Video[] {
    return this.videosSignal().filter(v => v.category.id === categoryId);
  }
}