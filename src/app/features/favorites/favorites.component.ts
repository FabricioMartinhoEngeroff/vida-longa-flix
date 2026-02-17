import { Component, HostListener, OnInit, effect } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { CarouselComponent } from '../../shared/components/carousel/carousel.component';
import { TitleComponent } from '../../shared/components/title/title.component';

import { Video } from '../../shared/types/videos';
import { FavoritesService } from '../../shared/services/favorites/favorites.service.';
import { ModalService } from '../../shared/services/modal/modal.service';
import { VideoService } from '../../shared/services/video/video.service';

import { MenuService } from '../../shared/services/menus/menus-service';
import { Menu } from '../../shared/types/menu';
import { MenuFavoritesService } from '../../shared/services/menus/menu-favorites.sevice';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [NgIf, NgFor, MatIconModule, CarouselComponent, TitleComponent],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css'],
})
export class FavoritesComponent implements OnInit {
  favoriteVideos: Video[] = [];
  favoriteMenus: Menu[] = [];
  selectedMenu: Menu | null = null;

  isMobile: boolean = window.innerWidth <= 768;

  private menuModalInHistory = false;

  constructor(
    private router: Router,
    private favoritesService: FavoritesService,
    private modalService: ModalService,
    private videoService: VideoService,
    private menuService: MenuService,
    private menuFavoritesService: MenuFavoritesService
  ) {
    
    effect(() => {
      this.favoriteVideos = this.favoritesService.favorites();
    });

    effect(() => {
      this.favoriteMenus = this.menuFavoritesService.favorites();
    });
  }

  ngOnInit(): void {}

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  viewAll(): void {
    this.router.navigate(['/app/favoritos']);
  }

  openVideoModal(video: Video): void {
    this.modalService.open(video);
  }

  removeVideo(video: Video): void {
    this.videoService.toggleFavorite(video.id);
  }

  openMenuModal(menu: Menu): void {
    if (!this.selectedMenu && typeof window !== 'undefined') {
      window.history.pushState({ modal: 'favorites-menu' }, '');
      this.menuModalInHistory = true;
    }
    this.selectedMenu = menu;
  }

  closeMenuModal(): void {
    if (!this.selectedMenu) return;

    this.selectedMenu = null;

    if (this.menuModalInHistory && typeof window !== 'undefined') {
      this.menuModalInHistory = false;
      window.history.back();
    }
  }

  @HostListener('window:popstate')
  onPopState(): void {
    if (!this.selectedMenu) return;
    this.selectedMenu = null;
    this.menuModalInHistory = false;
  }

  removeMenu(menu: Menu): void {
    this.menuService.toggleFavorite(menu.id);
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
