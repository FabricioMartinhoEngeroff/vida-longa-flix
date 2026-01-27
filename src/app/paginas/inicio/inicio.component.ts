import { NgFor, NgIf } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { BotaoFavoritarComponent } from '../../components/botao-favoritar/botao-favoritar.component';
import { CarrosselComponent } from '../../components/carrossel/carrossel.component';
import { TituloComponent } from '../../components/titulo/titulo.component';
import { ModalService } from '../../services/modal/modal';
import { VideoService } from '../../services/video/video';
import { Video } from '../../tipos/videos';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    MatIconModule,
    TituloComponent,
    CarrosselComponent,
    BotaoFavoritarComponent,
  ],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
})

export class InicioComponent implements OnInit {
  videosReels: Video[] = [];
  isMobile = false;

  // Estado de comentários
  comentariosState: { [videoId: string]: string[] } = {};  
  novoComentario: { [videoId: string]: string } = {};      

  // Preview ao hover
  mostrandoPrevia: { [id: string]: boolean } = {};         
  private timeoutsHover: { [id: string]: any } = {};       
  private readonly DELAY_HOVER = 2000;

  constructor(
    private videoService: VideoService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
  this.videoService.videosReels$.subscribe(videos => {
    this.videosReels = videos;
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
      videoEl.play().catch(() => {
        console.log('Autoplay bloqueado');
      });
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

    if (!this.comentariosState[videoId]) {
      this.comentariosState[videoId] = [];
    }

    this.comentariosState[videoId] = [
      ...this.comentariosState[videoId],
      `Você: ${texto}`,
    ];

    this.novoComentario[videoId] = '';
  }

  verTudo() {
    console.log('Ver tudo clicado');
  }
}