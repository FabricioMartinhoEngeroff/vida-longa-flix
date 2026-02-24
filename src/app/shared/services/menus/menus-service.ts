import { Injectable, signal, computed } from '@angular/core';
import initialMenus from '../../../../assets/cardapios.json';
import { Menu } from '../../types/menu';
import { FavoritesService } from '../favorites/favorites.service.';


@Injectable({ providedIn: 'root' })
export class MenuService {

  private menusSignal = signal<Menu[]>([]);

  readonly menus = this.menusSignal.asReadonly();
  readonly totalMenus = computed(() => this.menusSignal().length);
  readonly totalLikes = computed(() =>
    this.menusSignal().reduce((sum, m) => sum + (m.likesCount ?? 0), 0)
  );

  constructor(private favoritesService: FavoritesService) {
    const converted = this.convertMockedMenus();
    this.menusSignal.set(converted);
  }

  toggleFavorite(id: string): void {
    // Chama o backend via FavoritesService
    this.favoritesService.toggle(id, 'MENU');

    // Atualiza estado local otimisticamente
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

  add(menu: Menu): void {
    this.menusSignal.update(current => [menu, ...current]);
  }

  update(menu: Menu): void {
    this.menusSignal.update(current =>
      current.map(m => m.id === menu.id ? menu : m)
    );
  }

  remove(id: string): void {
    this.menusSignal.update(current =>
      current.filter(m => m.id !== id)
    );
  }

  getMenuById(id: string): Menu | undefined {
    return this.menusSignal().find(m => m.id === id);
  }

  getMenusByCategory(categoryId: string): Menu[] {
    return this.menusSignal().filter(m => m.category.id === categoryId);
  }

  private convertMockedMenus(): Menu[] {
    return (initialMenus as any[]).map(c => ({
      id: String(c.id),
      title: c.title,
      description: c.description,
      cover: c.capa,
      category: c.category ?? { id: '0', name: 'Sem categoria' },
      recipe: c.receita ?? '',
      nutritionistTips: c.dicasNutri ?? '',
      protein: c.proteinas ?? 0,
      carbs: c.carboidratos ?? 0,
      fat: c.gorduras ?? 0,
      fiber: c.fibras ?? 0,
      calories: c.calorias ?? 0,
      favorited: this.favoritesService.isFavorited(String(c.id), 'MENU'),
      likesCount: c.likesCount ?? 0,
    })) as Menu[];
  }
}