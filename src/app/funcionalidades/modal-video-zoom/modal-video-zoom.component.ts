import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';


import { Video } from '../../compartilhado/tipos/videos';
import { ModalService } from '../../compartilhado/servicos/modal/modal';
import { VideoService } from '../../compartilhado/servicos/video/video';
import { ComentariosBoxComponent } from '../../compartilhado/componentes/comentarios-box/comentarios-box.component';
import { ComentariosService } from '../../compartilhado/servicos/comentarios/comentarios.service';
import { NgIf } from '@angular/common';

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

  constructor(
    private modalService: ModalService,
    private videoService: VideoService,
    private comentariosService: ComentariosService
  ) {}

  ngOnInit(): void {
    this.modalService.videoSelecionado$.subscribe(video => {
      this.videoSelecionado = video as unknown as Video | null;

      if (!this.videoSelecionado) {
        this.videoAtualizado = null;
        return;
      }

      this.videoAtualizado =
        this.videoService.videosReels.find((v) => v.id === this.videoSelecionado?.id) ??
        this.videoSelecionado;

      this.comentarios = this.comentariosService.get('video', this.videoAtualizado.id);
    });

    this.comentariosService.comentarios$.subscribe(map => {
      if (this.videoAtualizado) {
        this.comentarios = map[`video:${this.videoAtualizado.id}`] ?? [];
      }
    });
  }

  adicionarComentario(texto: string): void {
    if (!this.videoAtualizado) return;
    this.comentariosService.add('video', this.videoAtualizado.id, texto);
  }

  fecharModal(): void {
    this.modalService.fechar();
    this.videoSelecionado = null;
    this.videoAtualizado = null;
    this.comentarios = [];
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
