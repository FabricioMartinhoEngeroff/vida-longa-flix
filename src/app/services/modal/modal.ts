import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Video {
  id: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly videoSelecionadoSubject = new BehaviorSubject<Video | null>(null);

  /** equivalente: videoSelecionado */
  readonly videoSelecionado$ = this.videoSelecionadoSubject.asObservable();

  /** equivalente ao getter */
  get videoSelecionado(): Video | null {
    return this.videoSelecionadoSubject.value;
  }

  /** equivalente: isModalOpen */
  get isModalOpen(): boolean {
    return !!this.videoSelecionado;
  }

  /** equivalente: abrirModal(video) */
  abrir(video: Video): void {
    this.videoSelecionadoSubject.next(video);
  }

  /** equivalente: fecharModal() */
  fechar(): void {
    this.videoSelecionadoSubject.next(null);
  }
}
