import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Video } from '../../types/videos';
import { LoggerService } from '../../../auth/services/logger.service';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly baseUrl = `${environment.apiUrl}/videos`;
  private selectedVideoSignal = signal<Video | null>(null);

  readonly selectedVideo = this.selectedVideoSignal.asReadonly();
  readonly isModalOpen = computed(() => !!this.selectedVideoSignal());

  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) {}

  open(video: Video): void {
    this.http.patch<void>(`${this.baseUrl}/${video.id}/view`, {}).pipe(
      catchError((err) => {
        this.logger.error('Erro ao registrar view', err)
        return of(null);
      })
    ).subscribe();
    this.selectedVideoSignal.set(video);
  }

  close(): void {
    this.selectedVideoSignal.set(null);
  }

  isVideoOpen(videoId: string): boolean {
    return this.selectedVideoSignal()?.id === videoId;
  }
}
