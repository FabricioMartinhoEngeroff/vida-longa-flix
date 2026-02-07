import { Component, HostListener, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { CarrosselComponent } from '../../compartilhado/componentes/carrossel/carrossel.component';
import { TituloComponent } from '../../compartilhado/componentes/titulo/titulo.component';

import { Video } from '../../compartilhado/tipos/videos';
import { FavoritosService } from '../../compartilhado/servicos/favoritos/favoritos';
import { ModalService } from '../../compartilhado/servicos/modal/modal';
import { VideoService } from '../../compartilhado/servicos/video/video';

import { CardapioService } from '../../compartilhado/servicos/cardapio/cardapio-service';
import { Cardapio } from '../../compartilhado/tipos/ cardapios';
import { FavoritosCardapiosService } from '../../compartilhado/servicos/cardapio/ favoritos-cardapios';

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
    this.router.navigate(['/favoritos']);
  }

  abrirModal(video: Video): void {
    this.modalService.abrir(video);
  }

  remover(video: Video): void {
    this.videoService.toggleFavorite(video.id);
  }

  abrirModalCardapio(cardapio: Cardapio): void {
    this.cardapioSelecionado = cardapio;
  }

  fecharModalCardapio(): void {
    this.cardapioSelecionado = null;
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
