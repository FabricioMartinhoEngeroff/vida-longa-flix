import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of, EMPTY } from 'rxjs';
import { Video, VideoRequest } from '../../types/videos';
import { environment } from '../../../../environments/environment';
import { LoggerService } from '../../../auth/services/logger.service';
import { FavoritesService } from '../favorites/favorites.service.';
import { ContentNotificationsService } from '../notifications/content-notifications.service';
import { NotificationService } from '../alert-message/alert-message.service';

@Injectable({ providedIn: 'root' })
export class VideoService {

  // URLs separadas — leitura é pública, escrita é admin
  private readonly publicUrl = `${environment.apiUrl}/videos`;
  private readonly adminUrl = `${environment.apiUrl}/admin/videos`;

  private videosSignal = signal<Video[]>([]);

  readonly videos = this.videosSignal.asReadonly();
  readonly totalVideos = computed(() => this.videosSignal().length);
  readonly totalLikes = computed(() =>
    this.videosSignal().reduce((sum, v) => sum + (v.likesCount ?? 0), 0)
  );

  constructor(
    private http: HttpClient,
    private favoritesService: FavoritesService,
    private logger: LoggerService,
    private notifications: ContentNotificationsService,
    private alert: NotificationService
  ) {
    this.loadVideos();
  }

  // Rota pública — GET /videos
  loadVideos(): void {
    this.http.get<Video[]>(this.publicUrl).pipe(
      catchError(err => {
        this.logger.error('Erro ao carregar vídeos', err);
        return of([]);
      })
    ).subscribe(videos => {
      const synced = videos.map(v => ({
        ...v,
        favorited: this.favoritesService.isFavorited(v.id, 'VIDEO'),
        likesCount: v.likesCount ?? 0
      }));
      this.videosSignal.set(synced);
    });
  }

  toggleFavorite(id: string): void {
    this.favoritesService.toggle(id, 'VIDEO');
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

  // Rota admin — POST /admin/videos
  // O interceptor injeta o Bearer token automaticamente
  addVideo(request: VideoRequest): void {
    this.http.post<void>(this.adminUrl, request).pipe(
      tap(() => {
        this.notifications.add('VIDEO', request.title);
        this.alert.success(`Vídeo "${request.title}" salvo com sucesso!`);
        this.loadVideos();
      }),
      catchError(err => {
        this.logger.error('Erro ao criar vídeo', err);
        this.alert.error('Erro ao salvar vídeo. Tente novamente.');
        return of(null);
      })
    ).subscribe();
  }

  // Rota admin — PUT /admin/videos/{id}
  updateVideo(id: string, changes: Partial<Video>): void {
    this.http.put<void>(`${this.adminUrl}/${id}`, changes).pipe(
      tap(() => {
        this.alert.success('Vídeo atualizado com sucesso!');
        this.loadVideos();
      }),
      catchError(err => {
        this.logger.error('Erro ao atualizar vídeo', err);
        this.alert.error('Erro ao atualizar vídeo. Tente novamente.');
        return of(null);
      })
    ).subscribe();
  }

  // Rota admin — DELETE /admin/videos/{id}
  removeVideo(id: string): void {
    const current = this.videosSignal();
    const removedIndex = current.findIndex(v => v.id === id);
    const removed = removedIndex >= 0 ? current[removedIndex] : undefined;

    this.videosSignal.update(list => list.filter(v => v.id !== id));

    this.http.delete<void>(`${this.adminUrl}/${id}`).pipe(
      tap(() => this.alert.success('Vídeo removido com sucesso!')),
      catchError(err => {
        this.logger.error('Erro ao deletar vídeo', err);
        this.alert.error('Erro ao remover vídeo. Tente novamente.');
        if (removed) {
          this.videosSignal.update(list => {
            if (list.some(v => v.id === id)) return list;
            const next = [...list];
            next.splice(Math.min(removedIndex, next.length), 0, removed);
            return next;
          });
        }
        return EMPTY;
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
