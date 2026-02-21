import { Component, HostListener, OnInit, effect } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { MenuService } from '../../shared/services/menus/menus-service';
import { Menu } from '../../shared/types/menu';
import { MenuModalComponent } from '../../shared/components/menu-modal/menu-modal.component';
import { CategoryCarouselComponent } from '../../shared/components/category-carousel/category-carousel.component';
import { EngagementSummaryComponent } from '../../shared/components/engagement-summary/engagement-summary.component';
import { agruparPor as groupBy, Grupo as Group } from '../../shared/utils/agrupar-por';
import { MenuCommentsService } from '../../shared/services/menus/menu-comments-service';

type MenuGroup = Group<Menu>;

@Component({
  selector: 'app-menus', 
  standalone: true,
  imports: [CategoryCarouselComponent, MenuModalComponent, EngagementSummaryComponent],
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.css'],
})
export class MenusComponent implements OnInit {
  menusByCategory: MenuGroup[] = [];
  selected: Menu | null = null;

  commentsState: Record<string, string[]> = {};

  private menusList: Menu[] = [];
  private searchType = '';
  private searchId = '';
  private searchCategory = '';
  private searchTerm = '';

  private menuModalInHistory = false;

  constructor(
  private menuService: MenuService,
  private commentsService: MenuCommentsService,
  private route: ActivatedRoute
) {
    effect(() => {
      this.commentsState = this.commentsService.comments();
      const list = this.menuService.menus();
      this.menusList = list;

      this.menusByCategory = groupBy(list, (m) => m.category?.name || 'Sem categoria');

      this.syncSelected();
      this.tryScrollSearch();
    });

    effect(() => {
      this.commentsState = this.commentsService.comments();
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.searchType = (params['tipo'] || '').toLowerCase();
      this.searchId = (params['id'] || '').toString();
      this.searchCategory = (params['cat'] || '').toString();
      this.searchTerm = (params['q'] || '').toString();
      this.tryScrollSearch();
    });
  }

 addComment(id: string, text: string): void {
  this.commentsService.add(id, text);
}

  getTotalComments(id: string): number {
  return this.commentsState[id]?.length ?? 0;
}

getMenuComments(id: string): string[] {
  return this.commentsState[id] ?? [];
}

  open(menu: Menu): void {
    if (!this.selected && typeof window !== 'undefined') {
      window.history.pushState({ modal: 'menu' }, '');
      this.menuModalInHistory = true;
    }
    this.selected = menu;
  }

  close(): void {
    if (!this.selected) return;

    this.selected = null;

    if (this.menuModalInHistory && typeof window !== 'undefined') {
      this.menuModalInHistory = false;
      window.history.back();
    }
  }

  @HostListener('window:popstate')
  onPopState(): void {
    if (!this.selected) return;
    this.selected = null;
    this.menuModalInHistory = false;
  }

  toggleFavorite(id: string): void {
    this.menuService.toggleFavorite(id);
    this.syncSelected();
  }

  private syncSelected(): void {
    if (!this.selected) return;
    this.selected = this.menusList.find((m) => m.id === this.selected?.id) ?? null;
  }

  private tryScrollSearch(): void {
    if (!this.menusList.length) return;

    if (this.searchType === 'menu' && this.searchId) {
      this.scrollToElement(`menu-${this.searchId}`);
      return;
    }

    if (this.searchType === 'categoria-menu' && this.searchCategory) {
      this.scrollToElement(this.buildCategoryId(this.searchCategory));
      return;
    }

    if (!this.searchTerm) return;

    const normalizedTerm = this.normalizeText(this.searchTerm);
    const target = [...this.menusList]
      .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }))
      .find((m) =>
        this.normalizeText(m.title).includes(normalizedTerm) ||
        this.normalizeText(m.description).includes(normalizedTerm) ||
        this.normalizeText(m.category?.name || '').includes(normalizedTerm)
      );

    if (target) this.scrollToElement(`menu-${target.id}`);
  }

  private scrollToElement(id: string): void {
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  }

  private buildCategoryId(name: string): string {
    return 'cat-' + name.toLowerCase().trim().replace(/\s+/g, '-');
  }

  private normalizeText(text: string): string {
    return (text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
