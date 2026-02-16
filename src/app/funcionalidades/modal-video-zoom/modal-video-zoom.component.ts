import { Component, HostListener, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';

import { Video } from '../../shared/types/videos';
import { ModalService } from '../../shared/services/modal/modal';
import { VideoService } from '../../shared/services/video/video';
import { ComentariosBoxComponent } from '../../shared/components/comments-box/comments-box.component';
import { ComentariosService } from '../../shared/services/comentarios/comentarios.service';

@Component({
  selector: 'app-modal-video-zoom',
  standalone: true,
  imports: [NgIf, MatIconModule, ComentariosBoxComponent],
  templateUrl: './modal-video-zoom.component.html',
  styleUrls: ['./modal-video-zoom.component.css'],
})
export class ModalVideoZoomComponent implements OnInit {
  videoSelecionado: Video | null = null;
  videoAtualizado: Video | null = null;
  comentarios: string[] = [];

  private modalVideoNoHistorico = false;

  constructor(
    private modalService: ModalService,
    private videoService: VideoService,
    private comentariosService: ComentariosService
  ) {}

  ngOnInit(): void {
    this.modalService.videoSelecionado$.subscribe((video) => {
      this.videoSelecionado = video as unknown as Video | null;

      if (!this.videoSelecionado) {
        this.videoAtualizado = null;
        this.comentarios = [];
        this.modalVideoNoHistorico = false;
        return;
      }

      if (!this.modalVideoNoHistorico && typeof window !== 'undefined') {
        window.history.pushState({ modal: 'video' }, '');
        this.modalVideoNoHistorico = true;
      }

      this.videoAtualizado =
        this.videoService.videosReels.find((v) => v.id === this.videoSelecionado?.id) ??
        this.videoSelecionado;

      this.comentarios = this.comentariosService.get('video', this.videoAtualizado.id);
    });

    this.comentariosService.comentarios$.subscribe((map) => {
      if (this.videoAtualizado) {
        this.comentarios = map[`video:${this.videoAtualizado.id}`] ?? [];
      }
    });
  }

  @HostListener('window:popstate')
  onPopState(): void {
    if (!this.videoSelecionado) return;
    this.modalVideoNoHistorico = false;
    this.modalService.fechar();
  }

  adicionarComentario(texto: string): void {
    if (!this.videoAtualizado) return;
    this.comentariosService.add('video', this.videoAtualizado.id, texto);
  }

  fecharModal(): void {
    if (!this.videoSelecionado) return;

    const tinhaEntradaModal = this.modalVideoNoHistorico;
    this.modalVideoNoHistorico = false;
    this.modalService.fechar();

    if (tinhaEntradaModal && typeof window !== 'undefined') {
      window.history.back();
    }
  }

  impedirFechar(event: MouseEvent): void {
    event.stopPropagation();
  }

  toggleFavorite(): void {
    if (!this.videoAtualizado) return;
    this.videoService.toggleFavorite(this.videoAtualizado.id);

    this.videoAtualizado =
      this.videoService.videosReels.find((v) => v.id === this.videoAtualizado?.id) ??
      this.videoAtualizado;
  }
}
