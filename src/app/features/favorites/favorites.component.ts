import { Component, OnInit, HostListener, effect } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CarouselComponent } from '../../shared/components/carousel/carousel.component';
import { TitleComponent } from '../../shared/components/title/title.component';
import { Video } from '../../shared/types/videos';
import { Menu } from '../../shared/types/menu';

import { VideoService } from '../../shared/services/video/video.service';
import { MenuService } from '../../shared/services/menus/menus-service';
import { ModalService } from '../../shared/services/modal/modal.service';
import { FavoritesService } from '../../shared/services/favorites/favorites.service.';

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
  isMobile = window.innerWidth <= 768;

  private menuModalInHistory = false;

  constructor(
    private router: Router,
    private favoritesService: FavoritesService,
    private videoService: VideoService,
    private menuService: MenuService,
    private modalService: ModalService
  ) {
    // Sincroniza videos favoritados com o estado do FavoritesService
    effect(() => {
      const favoriteIds = new Set(
        this.favoritesService.videoFavorites().map(f => f.itemId)
      );
      this.favoriteVideos = this.videoService.videos()
        .filter(v => favoriteIds.has(v.id));
    });

    // Sincroniza menus favoritados com o estado do FavoritesService
    effect(() => {
      const favoriteIds = new Set(
        this.favoritesService.menuFavorites().map(f => f.itemId)
      );
      this.favoriteMenus = this.menuService.menus()
        .filter(m => favoriteIds.has(m.id));
    });
  }

  ngOnInit(): void {
    // Carrega favoritos do backend ao entrar na tela
    this.favoritesService.load();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  openVideoModal(video: Video): void {
    this.modalService.open(video);
  }

  removeVideo(video: Video): void {
    this.videoService.toggleFavorite(video.id);
  }

  openMenuModal(menu: Menu): void {
    if (!this.selectedMenu) {
      window.history.pushState({ modal: 'favorites-menu' }, '');
      this.menuModalInHistory = true;
    }
    this.selectedMenu = menu;
  }

  closeMenuModal(): void {
    if (!this.selectedMenu) return;
    this.selectedMenu = null;
    if (this.menuModalInHistory) {
      this.menuModalInHistory = false;
      window.history.back();
    }
  }

  @HostListener('window:popstate')
  onPopState(): void {
    this.selectedMenu = null;
    this.menuModalInHistory = false;
  }

  removeMenu(menu: Menu): void {
    this.menuService.toggleFavorite(menu.id);
  }
}