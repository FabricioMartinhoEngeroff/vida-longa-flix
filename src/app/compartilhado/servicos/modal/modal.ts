import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HistoricoViewsService } from '../historico-views/historico-views';

export interface Video {
  id: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly videoSelecionadoSubject = new BehaviorSubject<Video | null>(null);

  readonly videoSelecionado$ = this.videoSelecionadoSubject.asObservable();

  constructor(private historicoViews: HistoricoViewsService) {}

  get videoSelecionado(): Video | null {
    return this.videoSelecionadoSubject.value;
  }

  get isModalOpen(): boolean {
    return !!this.videoSelecionado;
  }

  abrir(video: Video): void {
    const email = localStorage.getItem('userEmail') || 'guest@local';

    this.historicoViews.registrarView(email, video.id);

    this.videoSelecionadoSubject.next(video);
  }

  fechar(): void {
    this.videoSelecionadoSubject.next(null);
  }
}
