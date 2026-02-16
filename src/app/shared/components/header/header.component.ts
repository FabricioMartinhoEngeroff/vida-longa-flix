import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';


import { NotificacoesComponent } from '../notificações/notificacoes.component';
import { MenuUsuarioComponent } from '../user-menu/user-menu.component';


import { CardapioService } from '../../services/menus/menus-service';
import { VideoService } from '../../services/video/video';
import { SearchFieldComponent } from '../search-field/search-field.component';
import { LogoutButtonComponent } from '../logout-button/logout-button.component';

type IndexedItem = { id: string; title: string; categoryName: string };

// Tipos mínimos só pra evitar implicit any (sem depender dos teus models reais)
type VideoLike = { id: string; title: string; category?: { name?: string } | null };
type CardapioLike = { id: string; title: string; category?: { name?: string } | null };

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [SearchFieldComponent, NotificacoesComponent, MenuUsuarioComponent, LogoutButtonComponent],
})
export class HeaderComponent implements OnInit {
  private router = inject(Router);

  searchCategories: string[] = [];
  searchSuggestions: string[] = [];

  private videosIndex: IndexedItem[] = [];
  private cardapiosIndex: IndexedItem[] = [];

  constructor(
    private scroller: ViewportScroller,
    private videoService: VideoService,
    private cardapioService: CardapioService
  ) {}

  ngOnInit(): void {
    this.videoService.videosReels$.subscribe((videos: VideoLike[]) => {
      this.videosIndex = videos.map((v: VideoLike) => ({
        id: v.id,
        title: v.title,
        categoryName: v.category?.name || '',
      }));
    });

    this.cardapioService.cardapios$.subscribe((cardapios: CardapioLike[]) => {
      this.cardapiosIndex = cardapios.map((c: CardapioLike) => ({
        id: c.id,
        title: c.title,
        categoryName: c.category?.name || '',
      }));
    });
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
        ...this.cardapiosIndex.map((c) => c.title),
      ]),
    ];

    const categories = [
      ...new Set([
        ...this.videosIndex.map((v) => v.categoryName),
        ...this.cardapiosIndex.map((c) => c.categoryName),
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

    const exactCardapio = this.cardapiosIndex.find((c) => this.normalize(c.title) === normalizedTerm);
    if (exactCardapio) {
      this.router.navigate(['/app/cardapios'], {
        queryParams: { tipo: 'cardapio', id: exactCardapio.id, q: term },
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

    const exactCardapioCategory = this.cardapiosIndex.find(
      (c) => this.normalize(c.categoryName) === normalizedTerm
    )?.categoryName;

    if (exactCardapioCategory) {
      this.router.navigate(['/app/cardapios'], {
        queryParams: { tipo: 'categoria-cardapio', cat: exactCardapioCategory, q: term },
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
