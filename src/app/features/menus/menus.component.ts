import { Component, DestroyRef, HostListener, Inject, OnInit, effect, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Params } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../../auth/services/auth.service';
import { MenuService } from '../../shared/services/menus/menus-service';
import { Menu } from '../../shared/types/menu';
import { MenuModalComponent } from '../../shared/components/menu-modal/menu-modal.component';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { CategoryCarouselComponent } from '../../shared/components/category-carousel/category-carousel.component';
import { EngagementSummaryComponent } from '../../shared/components/engagement-summary/engagement-summary.component';
import { agruparPor as groupBy, Grupo as Group } from '../../shared/utils/agrupar-por';
import { MenuCommentsService } from '../../shared/services/menus/menu-comments-service';

type MenuGroup = Group<Menu>;

@Component({
  selector: 'app-menus', 
  standalone: true,
  imports: [MatIconModule, CategoryCarouselComponent, MenuModalComponent, EngagementSummaryComponent, ConfirmationModalComponent],
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.css'],
})
export class MenusComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  menusByCategory: MenuGroup[] = [];
  selected: Menu | null = null;

  commentsState: Record<string, string[]> = {};

  isAdmin = false;
  isDeleteModalOpen = false;
  private pendingDelete: { id: string; label: string } | null = null;

  private menusList: Menu[] = [];
  private searchType = '';
  private searchId = '';
  private searchCategory = '';
  private searchTerm = '';

  private menuModalInHistory = false;

  constructor(
  private menuService: MenuService,
  @Inject(MenuCommentsService) private commentsService: MenuCommentsService,
  private route: ActivatedRoute,
  private authService: AuthService
) {
    this.authService.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((u) => {
        this.isAdmin = !!u?.roles?.some((r) => r === 'ROLE_ADMIN');
      });
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

  deleteComment(menuId: string, commentText: string): void {
    this.commentsService.delete(menuId, commentText);
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

  onMenuFieldSave(menuId: string, event: { field: string; value: string | number }): void {
    this.menuService.updateMenu(menuId, ({ [event.field]: event.value } as Partial<Menu>));
  }

  askDeleteMenu(id: string, title: string): void {
    this.pendingDelete = { id, label: title };
    this.isDeleteModalOpen = true;
  }

  cancelDelete(): void {
    this.isDeleteModalOpen = false;
    this.pendingDelete = null;
  }

  confirmDelete(): void {
    if (!this.pendingDelete) return;
    this.menuService.removeMenu(this.pendingDelete.id);
    this.cancelDelete();
  }

  readonly deleteTitle = 'Deletar cardápio';

  get deleteMessage(): string {
    return `Deseja mesmo deletar o cardápio "${this.pendingDelete?.label ?? ''}"?`;
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

  onEditCoverFile(menuId: string, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Validação de tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Validação de tamanho (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return;
    }

    // TODO: Implementar upload real quando backend suportar
    // Por enquanto, usa URL pública ou permanece vazio
    const publicUrl = ''; // Placeholder para upload real
    this.menuService.updateMenu(menuId, { cover: publicUrl });
  }
}
