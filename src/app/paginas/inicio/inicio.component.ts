import { Component, HostListener, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { CarrosselComponent } from '../../components/carrossel/carrossel.component';
import { TituloComponent } from '../../components/titulo/titulo.component';
import { BotaoFavoritarComponent } from '../../components/botao-favoritar/botao-favoritar.component';

import { VideoService } from '../../services/video/video';
import { ModalService } from '../../services/modal/modal';
import { Video } from '../../tipos/videos';
@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    MatIconModule,
    CarrosselComponent,
    TituloComponent,
    BotaoFavoritarComponent,
  ],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
})
export class InicioComponent implements OnInit {
  isMobile: boolean = window.innerWidth <= 768;

  videosReels: Video[] = [];

  // comentários por vídeo (id => string[])
  comentariosState: Record<string, string[]> = {};

  // input por vídeo (id => string)
  novoComentario: Record<string, string> = {};

  constructor(
    private videoService: VideoService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.videosReels = this.videoService.videosReels;

    // cria o estado inicial dos comentários (igual teu useState com map)
    this.comentariosState = Object.fromEntries(
      this.videosReels.map((video) => [
        video.id,
        video.comments?.map((c: any) => `${c.user?.name ?? 'user'}: ${c.text}`) ?? [],
      ])
    );
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  verTudo(): void {
    console.log('Ver tudo');
  }

  abrirModal(video: Video): void {
    this.modalService.abrir(video);
  }

  toggleFavorite(videoId: string): void {
    this.videoService.toggleFavorite(videoId);
    // atualiza lista local (caso o service altere referência)
    this.videosReels = [...this.videoService.videosReels];
  }

  adicionarComentario(videoId: string): void {
    const texto = this.novoComentario[videoId];
    if (!texto) return;

    const comentario = `Você: ${texto}`;

    this.comentariosState = {
      ...this.comentariosState,
      [videoId]: [...(this.comentariosState[videoId] || []), comentario],
    };

    this.novoComentario = { ...this.novoComentario, [videoId]: '' };
  }

  // hover play/pause (só desktop)
  playVideo(event: Event): void {
    if (this.isMobile) return;
    const video = event.target as HTMLVideoElement;
    video.play();
  }

  pauseVideo(event: Event): void {
    if (this.isMobile) return;
    const video = event.target as HTMLVideoElement;
    video.pause();
  }
}
