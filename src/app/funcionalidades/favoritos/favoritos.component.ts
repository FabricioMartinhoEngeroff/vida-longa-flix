import { Component, HostListener, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { CarrosselComponent } from '../../shared/components/carousel/carousel.component';
import { TituloComponent } from '../../shared/components/title/title.component';

import { Video } from '../../shared/types/videos';
import { FavoritosService } from '../../shared/services/favoritos/favoritos';
import { ModalService } from '../../shared/services/modal/modal';
import { VideoService } from '../../shared/services/video/video';

import { CardapioService } from '../../shared/services/menus/menus-service';
import { Cardapio } from '../../shared/types/menu';
import { FavoritosCardapiosService } from '../../shared/services/menus/ favoritos-cardapios';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [NgIf, NgFor, MatIconModule, CarrosselComponent, TituloComponent],
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.css'],
})
export class FavoritosComponent implements OnInit {
  favoritos: Video[] = [];
  favoritosCardapios: Cardapio[] = [];
  cardapioSelecionado: Cardapio | null = null;

  isMobile: boolean = window.innerWidth <= 768;

  private modalCardapioNoHistorico = false;

  constructor(
    private router: Router,
    private favoritosService: FavoritosService,
    private modalService: ModalService,
    private videoService: VideoService,
    private cardapioService: CardapioService,
    private favoritosCardapiosService: FavoritosCardapiosService

  ) {}

  ngOnInit(): void {
    this.favoritosService.favoritos$.subscribe(favoritos => {
      this.favoritos = favoritos;
    });

    this.favoritosCardapiosService.favoritos$.subscribe(list => {
      this.favoritosCardapios = list;
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  verTudo(): void {
    this.router.navigate(['/app/favoritos']);
  }

  abrirModal(video: Video): void {
    this.modalService.abrir(video);
  }

  remover(video: Video): void {
    this.videoService.toggleFavorite(video.id);
  }

 abrirModalCardapio(cardapio: Cardapio): void {
  if (!this.cardapioSelecionado && typeof window !== 'undefined') {
    window.history.pushState({ modal: 'cardapio-favoritos' }, '');
    this.modalCardapioNoHistorico = true;
  }
  this.cardapioSelecionado = cardapio;
}

fecharModalCardapio(): void {
  if (!this.cardapioSelecionado) return;

  this.cardapioSelecionado = null;

  if (this.modalCardapioNoHistorico && typeof window !== 'undefined') {
    this.modalCardapioNoHistorico = false;
    window.history.back();
  }
}

@HostListener('window:popstate')
onPopState(): void {
  if (!this.cardapioSelecionado) return;
  this.cardapioSelecionado = null;
  this.modalCardapioNoHistorico = false;
}

  removerCardapio(cardapio: Cardapio): void {
    this.cardapioService.toggleFavorite(cardapio.id);
  }

  playVideo(event: Event): void {
    if (!this.isMobile) {
      const video = event.target as HTMLVideoElement;
      video.play();
    }
  }

  pauseVideo(event: Event): void {
    if (!this.isMobile) {
      const video = event.target as HTMLVideoElement;
      video.pause();
    }
  }
}
