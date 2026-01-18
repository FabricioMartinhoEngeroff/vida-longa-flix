import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { ModalService } from '../../services/modal/modal';
import { VideoService } from '../../services/video/video';
import { Video } from '../../tipos/videos';

@Component({
  selector: 'app-modal-video-zoom',
  standalone: true,
  imports: [NgIf, NgFor, MatIconModule, FormsModule],
  templateUrl: './modal-video-zoom.component.html',
  styleUrls: ['./modal-video-zoom.component.css'],
})
export class ModalVideoZoomComponent implements OnInit {
  videoSelecionado: Video | null = null;
  videoAtualizado: Video | null = null;

  novoComentario = '';
  comentarios: string[] = [];

  constructor(
    private modalService: ModalService,
    private videoService: VideoService
  ) {}

  ngOnInit(): void {
    this.videoSelecionado = this.modalService.videoSelecionado as unknown as Video | null;

    if (!this.videoSelecionado) return;

    // pega o vídeo atualizado do service (igual teu find no videosReels)
    this.videoAtualizado =
      this.videoService.videosReels.find(
        (v) => v.id === this.videoSelecionado?.id
      ) ?? null;
  }

  fecharModal(): void {
    this.modalService.fechar();
    this.videoSelecionado = null;
    this.videoAtualizado = null;
  }

  impedirFechar(event: MouseEvent): void {
    event.stopPropagation();
  }

  toggleFavorite(): void {
    if (!this.videoAtualizado) return;
    this.videoService.toggleFavorite(this.videoAtualizado.id);

    // atualiza estado local
    this.videoAtualizado =
      this.videoService.videosReels.find((v) => v.id === this.videoAtualizado?.id) ??
      this.videoAtualizado;
  }

  adicionarComentario(): void {
    const comentarioLimpo = this.novoComentario.trim();
    if (!comentarioLimpo) return;

    this.comentarios = [...this.comentarios, `Você: ${comentarioLimpo}`];
    this.novoComentario = '';
  }
}
