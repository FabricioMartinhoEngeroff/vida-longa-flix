import { Component, DestroyRef, OnInit, HostListener, effect, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoryCarouselComponent } from '../../shared/components/category-carousel/category-carousel.component';
import { EngagementSummaryComponent } from '../../shared/components/engagement-summary/engagement-summary.component';
import { TitleComponent } from '../../shared/components/title/title.component';
import { Video } from '../../shared/types/videos';
import { Menu } from '../../shared/types/menu';

import { VideoService } from '../../shared/services/video/video.service';
import { MenuService } from '../../shared/services/menus/menus-service';
import { ModalService } from '../../shared/services/modal/modal.service';
import { FavoritesService } from '../../shared/services/favorites/favorites.service.';
import { AuthService } from '../../auth/services/auth.service';
import { agruparPor as groupBy, Grupo as Group } from '../../shared/utils/agrupar-por';
import { MenuModalComponent } from '../../shared/components/menu-modal/menu-modal.component';
import { MenuCommentsService } from '../../shared/services/menus/menu-comments-service';

type VideoGroup = Group<Video>;
type MenuGroup = Group<Menu>;

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    MatIconModule,
    CategoryCarouselComponent,
    EngagementSummaryComponent,
    MenuModalComponent,
    TitleComponent,
  ],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css'],
})
export class FavoritesComponent implements OnInit {

  favoriteVideos: Video[] = [];
  videosByCategory: VideoGroup[] = [];

  favoriteMenus: Menu[] = [];
  menusByCategory: MenuGroup[] = [];
  selectedMenu: Menu | null = null;
  isMobile = window.innerWidth <= 768;
  isAdmin = false;

  private readonly destroyRef = inject(DestroyRef);
  private commentsState: Record<string, string[]> = {};
  private menuModalInHistory = false;

  constructor(
    private router: Router,
    private favoritesService: FavoritesService,
    private videoService: VideoService,
    private menuService: MenuService,
    private modalService: ModalService,
    private menuCommentsService: MenuCommentsService,
    private authService: AuthService
  ) {
    this.authService.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((u) => {
        this.isAdmin = !!u?.roles?.some((r) => r === 'ROLE_ADMIN');
      });
    // Sincroniza videos favoritados com o estado do FavoritesService
    effect(() => {
      const favoriteIds = new Set(
        this.favoritesService.videoFavorites().map(f => f.itemId)
      );
      this.favoriteVideos = this.videoService.videos()
        .filter(v => favoriteIds.has(v.id));

      this.videosByCategory = groupBy(
        this.favoriteVideos,
        (v) => v.category?.name || 'Sem categoria'
      );
    });

    // Sincroniza menus favoritados com o estado do FavoritesService
    effect(() => {
      this.commentsState = this.menuCommentsService.comments();

      const favoriteIds = new Set(
        this.favoritesService.menuFavorites().map(f => f.itemId)
      );
      this.favoriteMenus = this.menuService.menus()
        .filter(m => favoriteIds.has(m.id));

      this.menusByCategory = groupBy(
        this.favoriteMenus,
        (m) => m.category?.name || 'Sem categoria'
      );

      this.syncSelectedMenu();
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

  toggleMenuFavorite(menuId: string): void {
    this.menuService.toggleFavorite(menuId);
    if (this.selectedMenu?.id === menuId) {
      this.closeMenuModal();
    }
  }

  onMenuFieldSave(menuId: string, event: { field: string; value: string | number }): void {
    this.menuService.updateMenu(menuId, ({ [event.field]: event.value } as Partial<Menu>));
  }

  addMenuComment(menuId: string, text: string): void {
    this.menuCommentsService.add(menuId, text);
  }

  deleteMenuComment(menuId: string, commentText: string): void {
    this.menuCommentsService.delete(menuId, commentText);
  }

  getTotalMenuComments(menuId: string): number {
    return this.commentsState[menuId]?.length ?? 0;
  }

  getMenuComments(menuId: string): string[] {
    return this.commentsState[menuId] ?? [];
  }

  viewAll(): void {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private syncSelectedMenu(): void {
    if (!this.selectedMenu) return;
    const updated = this.favoriteMenus.find((m) => m.id === this.selectedMenu?.id) ?? null;
    if (!updated) {
      this.closeMenuModal();
      return;
    }
    this.selectedMenu = updated;
  }
}
