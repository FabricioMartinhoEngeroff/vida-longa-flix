import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Menu, MenuRequest } from '../../types/menu';
import { FavoritesService } from '../favorites/favorites.service.';
import { LoggerService } from '../../../auth/services/logger.service';
import { ContentNotificationsService } from '../notifications/content-notifications.service';

@Injectable({ providedIn: 'root' })
export class MenuService {

  private readonly publicUrl = `${environment.apiUrl}/menus`;
  private readonly adminUrl = `${environment.apiUrl}/admin/menus`;

  private menusSignal = signal<Menu[]>([]);

  readonly menus = this.menusSignal.asReadonly();
  readonly totalMenus = computed(() => this.menusSignal().length);
  readonly totalLikes = computed(() =>
    this.menusSignal().reduce((sum, m) => sum + (m.likesCount ?? 0), 0)
  );

  constructor(
    private http: HttpClient,
    private favoritesService: FavoritesService,
    private logger: LoggerService,
    private notifications: ContentNotificationsService
  ) {
    this.loadMenus();
  }

  loadMenus(): void {
    this.http.get<Menu[]>(this.publicUrl).pipe(
      catchError(err => {
        this.logger.error('Erro ao carregar menus', err);
        return of([]);
      })
    ).subscribe(menus => {
      const synced = menus.map(m => ({
        ...m,
        favorited: this.favoritesService.isFavorited(m.id, 'MENU'),
        likesCount: m.likesCount ?? 0
      }));
      this.menusSignal.set(synced);
    });
  }

  toggleFavorite(id: string): void {
    this.favoritesService.toggle(id, 'MENU');
    this.menusSignal.update(current =>
      current.map(menu => {
        if (menu.id !== id) return menu;
        const newFavorited = !menu.favorited;
        return {
          ...menu,
          favorited: newFavorited,
          likesCount: newFavorited
            ? (menu.likesCount ?? 0) + 1
            : Math.max(0, (menu.likesCount ?? 0) - 1)
        };
      })
    );
  }

  addMenu(request: MenuRequest): void {
    this.http.post<void>(this.adminUrl, request).pipe(
      tap(() => {
        this.notifications.add('MENU', request.title);
        this.loadMenus();
      }),
      catchError(err => {
        this.logger.error('Erro ao criar menu', err);
        return of(null);
      })
    ).subscribe();
  }

  removeMenu(id: string): void {
    this.http.delete<void>(`${this.adminUrl}/${id}`).pipe(
      tap(() => this.loadMenus()),
      catchError(err => {
        this.logger.error('Erro ao deletar menu', err);
        return of(null);
      })
    ).subscribe();
  }

  getMenuById(id: string): Menu | undefined {
    return this.menusSignal().find(m => m.id === id);
  }

  getMenusByCategory(categoryId: string): Menu[] {
    return this.menusSignal().filter(m => m.category.id === categoryId);
  }
}
