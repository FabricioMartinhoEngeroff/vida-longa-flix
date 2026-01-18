import { Component, HostListener, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { CarrosselComponent } from '../../components/carrossel/carrossel.component';
import { TituloComponent } from '../../components/titulo/titulo.component';

import { FavoritosService } from '../../services/favoritos/favoritos';
import { VideoService } from '../../services/video/video';
import { ModalService } from '../../services/modal/modal';
import { Video } from '../../tipos/videos';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [NgIf, NgFor, MatIconModule, CarrosselComponent, TituloComponent],
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.css'],
})
export class FavoritosComponent implements OnInit {
  favoritos: Video[] = [];
  isMobile: boolean = window.innerWidth <= 768;

  constructor(
    private router: Router,
    private favoritosService: FavoritosService,
    private modalService: ModalService,
    private videoService: VideoService
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.favoritos = this.favoritosService.listarFavoritos();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  verTudo(): void {
    // pode manter ou remover, mas deixei pra preservar essência
    this.router.navigate(['/favoritos']);
  }

  abrirModal(video: Video): void {
    this.modalService.abrir(video);
  }

  remover(video: Video): void {
    this.videoService.toggleFavorite(video.id);
    this.carregar();
  }

  playVideo(event: Event): void {
    // desktop only
    if (!this.isMobile) {
      const video = event.target as HTMLVideoElement;
      video.play();
    }
  }

  pauseVideo(event: Event): void {
    // desktop only
    if (!this.isMobile) {
      const video = event.target as HTMLVideoElement;
      video.pause();
    }
  }
}
