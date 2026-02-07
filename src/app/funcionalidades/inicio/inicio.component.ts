import { NgFor, NgIf } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { BotaoFavoritarComponent } from '../../compartilhado/componentes/botao-favoritar/botao-favoritar.component';
import { CategoriaCarrosselComponent } from '../../compartilhado/componentes/categoria-carrossel/categoria-carrossel.component';
import { Video } from '../../compartilhado/tipos/videos';
import { ModalService } from '../../compartilhado/servicos/modal/modal';
import { VideoService } from '../../compartilhado/servicos/video/video';
import { ComentariosService } from '../../compartilhado/servicos/comentarios/comentarios.service';
import { agruparPor, Grupo } from '../../compartilhado/utils/agrupar-por';

type GrupoVideo = Grupo<Video>;

@Component({
  selector: 'app-inicio',
  standalone: true,
imports: [NgFor, NgIf, MatIconModule, CategoriaCarrosselComponent, BotaoFavoritarComponent],
  templateUrl:'./inicio.component.html',
  styleUrls: ['./inicio.component.css'],
})
export class InicioComponent implements OnInit {
  videosReels: Video[] = [];
  videosPorCategoria: GrupoVideo[] = [];
  isMobile = false;

  comentariosState: Record<string, string[]> = {};
  novoComentario: Record<string, string> = {};

  mostrandoPrevia: Record<string, boolean> = {};
  private timeoutsHover: Record<string, any> = {};
  private readonly DELAY_HOVER = 2000;

  constructor(
    private videoService: VideoService,
    private modalService: ModalService,
    private comentariosService: ComentariosService
  ) {}

  ngOnInit(): void {
    this.videoService.videosReels$.subscribe(videos => {
      this.videosReels = videos;
      this.videosPorCategoria = agruparPor(
        videos,
        v => v.category?.name || 'Sem categoria'
      );
    });

    this.comentariosService.comentarios$.subscribe(map => {
      this.comentariosState = map;
    });

    this.verificarMobile();
  }

  @HostListener('window:resize')
  onResize() {
    this.verificarMobile();
  }

  verificarMobile() {
    this.isMobile = window.innerWidth <= 768;
  }

  aoPassarMouseVideo(videoId: string, event: Event) {
    const wrapper = event.currentTarget as HTMLElement;
    const videoEl = wrapper.querySelector('video') as HTMLVideoElement;

    if (this.timeoutsHover[videoId]) {
      clearTimeout(this.timeoutsHover[videoId]);
    }

    this.timeoutsHover[videoId] = setTimeout(() => {
      this.mostrandoPrevia[videoId] = true;
      videoEl.currentTime = 0;
      videoEl.muted = true;
      videoEl.play().catch(() => {});
    }, this.DELAY_HOVER);
  }

  aoSairMouseVideo(videoId: string, event: Event) {
    const wrapper = event.currentTarget as HTMLElement;
    const videoEl = wrapper.querySelector('video') as HTMLVideoElement;

    if (this.timeoutsHover[videoId]) {
      clearTimeout(this.timeoutsHover[videoId]);
      delete this.timeoutsHover[videoId];
    }

    this.mostrandoPrevia[videoId] = false;
    videoEl.pause();
    videoEl.currentTime = 0;
  }

  abrirModal(video: Video) {
    this.modalService.abrir(video);
  }

  toggleFavorite(videoId: string) {
    this.videoService.toggleFavorite(videoId);
  }

  adicionarComentario(videoId: string) {
    const texto = this.novoComentario[videoId]?.trim();
    if (!texto) return;

    this.comentariosService.add(videoId, texto);
    this.novoComentario[videoId] = '';
  }

  verTudo() {
    console.log('Ver tudo clicado');
  }
}
