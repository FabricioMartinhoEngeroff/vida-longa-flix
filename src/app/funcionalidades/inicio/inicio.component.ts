import { NgFor } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Params } from '@angular/router';

import { CategoriaCarrosselComponent } from '../../shared/components/category-carousel/category-carousel.component';
import { EngajamentoResumoComponent } from '../../shared/components/engagement-summary/engagement-summary.component';
import { Video } from '../../shared/types/videos';
import { ModalService } from '../../shared/services/modal/modal';
import { VideoService } from '../../shared/services/video/video';
import { ComentariosService } from '../../shared/services/comentarios/comentarios.service';
import { agruparPor, Grupo } from '../../shared/utils/agrupar-por';

type GrupoVideo = Grupo<Video>;

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    NgFor,
    MatIconModule,
    CategoriaCarrosselComponent,
    EngajamentoResumoComponent,
  ],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
})
export class InicioComponent implements OnInit {
  videosReels: Video[] = [];
  videosPorCategoria: GrupoVideo[] = [];
  isMobile = false;

  comentariosState: Record<string, string[]> = {};

  mostrandoPrevia: Record<string, boolean> = {};
  private timeoutsHover: Record<string, any> = {};
  private readonly DELAY_HOVER = 2000;
  private tipoBusca = '';
  private idBusca = '';
  private categoriaBusca = '';
  private termoBusca = '';


  constructor(
    private videoService: VideoService,
    private modalService: ModalService,
    private comentariosService: ComentariosService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
  this.videoService.videosReels$.subscribe((videos) => {
    this.videosReels = videos;
    this.videosPorCategoria = agruparPor(
      videos,
      (v) => v.category?.name || 'Sem categoria'
    );
    this.tentarScrollBusca();
  });

  this.comentariosService.comentarios$.subscribe((map) => {
    this.comentariosState = map;
  });

  this.route.queryParams.subscribe((params: Params) => {
    this.tipoBusca = (params['tipo'] || '').toLowerCase();
    this.idBusca = (params['id'] || '').toString();
    this.categoriaBusca = (params['cat'] || '').toString();
    this.termoBusca = (params['q'] || '').toString();
    this.tentarScrollBusca();
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

  totalComentarios(videoId: string): number {
    return this.comentariosState[`video:${videoId}`]?.length ?? 0;
  }

  verTudo() {
    console.log('Ver tudo clicado');
  }

    private tentarScrollBusca() {
    if (!this.videosReels.length) return;

    if (this.tipoBusca === 'video' && this.idBusca) {
      this.scrollParaElemento(`video-${this.idBusca}`);
      return;
    }

    if (this.tipoBusca === 'categoria-video' && this.categoriaBusca) {
      this.scrollParaElemento(this.criarIdCategoria(this.categoriaBusca));
      return;
    }

    if (!this.termoBusca) return;

    const termoN = this.normalizar(this.termoBusca);
    const alvo = [...this.videosReels]
      .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }))
      .find(v =>
        this.normalizar(v.title).includes(termoN) ||
        this.normalizar(v.description).includes(termoN) ||
        this.normalizar(v.category?.name || '').includes(termoN)
      );

    if (alvo) {
      this.scrollParaElemento(`video-${alvo.id}`);
    }
  }

  private scrollParaElemento(id: string) {
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  }

  private criarIdCategoria(nome: string): string {
    return 'cat-' + nome.toLowerCase().trim().replace(/\s+/g, '-');
  }

  private normalizar(texto: string): string {
    return (texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
