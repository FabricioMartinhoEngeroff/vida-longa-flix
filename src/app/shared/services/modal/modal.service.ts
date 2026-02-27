import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { catchError, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { LoggerService } from '../../../auth/services/logger.service';
import { Video } from '../../types/videos';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly selectedVideoSignal = signal<Video | null>(null);

  readonly selectedVideo = this.selectedVideoSignal.asReadonly();
  readonly isModalOpen = computed(() => this.selectedVideoSignal() !== null);

  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) {}

  open(video: Video): void {
    this.selectedVideoSignal.set(video);

    this.http
      .patch<void>(`${environment.apiUrl}/videos/${video.id}/view`, {})
      .pipe(
        catchError((err) => {
          this.logger.error('Erro ao registrar view do vídeo', err);
          return of(null);
        })
      )
      .subscribe();
  }

  close(): void {
    this.selectedVideoSignal.set(null);
  }

  isVideoOpen(id: string): boolean {
    return this.selectedVideoSignal()?.id === id;
  }
}
