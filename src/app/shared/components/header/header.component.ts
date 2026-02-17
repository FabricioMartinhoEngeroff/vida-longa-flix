import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { Subscription } from 'rxjs';

import { VideoService } from '../../services/video/video.service';
import { SearchFieldComponent } from '../search-field/search-field.component';
import { LogoutButtonComponent } from '../logout-button/logout-button.component';
import { UserMenuComponent } from '../user-menu/user-menu.component';
import { MenuService } from '../../services/menus/menus-service';
import { NotificationsComponent } from '../notifications/notifications.component';

type IndexedItem = { id: string; title: string; categoryName: string };

type VideoLike = { id: string; title: string; category?: { name?: string } | null };
type MenuLike = { id: string; title: string; category?: { name?: string } | null };

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [SearchFieldComponent, UserMenuComponent, LogoutButtonComponent, NotificationsComponent],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private subscriptions = new Subscription();

  searchCategories: string[] = [];
  searchSuggestions: string[] = [];

  private videosIndex: IndexedItem[] = [];
  private menusIndex: IndexedItem[] = [];

  constructor(
    private scroller: ViewportScroller,
    private videoService: VideoService,
    private menuService: MenuService
  ) {}

  
  ngOnInit(): void {
    this.subscriptions.add(
      this.updateVideosIndex()
    );

    this.subscriptions.add(
      this.updateMenusIndex()
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private updateVideosIndex(): void {
    const videos = this.videoService.videos();
    this.videosIndex = videos.map((v: VideoLike) => ({
      id: v.id,
      title: v.title,
      categoryName: v.category?.name || '',
    }));
  }

  private updateMenusIndex(): void {
    const menus = this.menuService.menus();
    this.menusIndex = menus.map((m: MenuLike) => ({
      id: m.id,
      title: m.title,
      categoryName: m.category?.name || '',
    }));
  }


  onSearchChange(value: string) {
    const term = (value || '').trim();

    if (this.normalize(term).replace(/\s+/g, '').length < 3) {
      this.searchCategories = [];
      this.searchSuggestions = [];
      return;
    }

    const tokens = this.tokenize(term);
    if (!tokens.length) {
      this.searchCategories = [];
      this.searchSuggestions = [];
      return;
    }

    const titles = [
      ...new Set([
        ...this.videosIndex.map((v) => v.title),
        ...this.menusIndex.map((m) => m.title),
      ]),
    ];

    const categories = [
      ...new Set([
        ...this.videosIndex.map((v) => v.categoryName),
        ...this.menusIndex.map((m) => m.categoryName),
      ]),
    ].filter(Boolean);

    this.searchSuggestions = this.sortByRelevance(titles, tokens);
    this.searchCategories = this.sortByRelevance(categories, tokens);
  }

  goToCategory(name: string) {
    const id = 'cat-' + name.toLowerCase().replace(/\s+/g, '-');
    this.scroller.scrollToAnchor(id);
  }


  goToSearch(originalTerm: string) {
    const term = (originalTerm || '').trim();
    if (!term) return;

    const normalizedTerm = this.normalize(term);

    const exactVideo = this.videosIndex.find((v) => this.normalize(v.title) === normalizedTerm);
    if (exactVideo) {
      this.router.navigate(['/app'], {
        queryParams: { tipo: 'video', id: exactVideo.id, q: term },
      });
      return;
    }

    const exactMenu = this.menusIndex.find((m) => this.normalize(m.title) === normalizedTerm);
    if (exactMenu) {
      this.router.navigate(['/app/menus'], {
        queryParams: { tipo: 'menu', id: exactMenu.id, q: term },
      });
      return;
    }

    const exactVideoCategory = this.videosIndex.find(
      (v) => this.normalize(v.categoryName) === normalizedTerm
    )?.categoryName;

    if (exactVideoCategory) {
      this.router.navigate(['/app'], {
        queryParams: { tipo: 'categoria-video', cat: exactVideoCategory, q: term },
      });
      return;
    }

    const exactMenuCategory = this.menusIndex.find(
      (m) => this.normalize(m.categoryName) === normalizedTerm
    )?.categoryName;

    if (exactMenuCategory) {
      this.router.navigate(['/app/menus'], {
        queryParams: { tipo: 'categoria-menu', cat: exactMenuCategory, q: term },
      });
      return;
    }

    this.router.navigate(['/app'], { queryParams: { q: term } });
  }


  private normalize(text: string): string {
    return (text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private tokenize(text: string): string[] {
    const stop = new Set([
      'de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'as', 'os', 'um', 'uma', 'com', 'para', 'por',
    ]);

    return this.normalize(text)
      .split(/\s+/)
      .filter((p) => p.length >= 2 && !stop.has(p));
  }

  private score(item: string, tokens: string[]): number {
    const base = this.normalize(item);
    return tokens.reduce((acc, t) => acc + (base.includes(t) ? 1 : 0), 0);
  }

  private sortByRelevance(list: string[], tokens: string[]): string[] {
    return [...list]
      .map((item) => ({ item, score: this.score(item, tokens) }))
      .filter((x) => x.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score || a.item.localeCompare(b.item, 'pt-BR', { sensitivity: 'base' })
      )
      .map((x) => x.item);
  }
}