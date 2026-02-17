import { Injectable, signal, computed } from '@angular/core';
import initialMenus from '../../../../assets/cardapios.json';
import { Menu } from '../../types/menu';
import { MenuFavoritesService } from './menu-favorites.sevice';


@Injectable({
  providedIn: 'root',
})
export class MenuService {

  private menusSignal = signal<Menu[]>([]);

  readonly menus = this.menusSignal.asReadonly();

  readonly totalMenus = computed(() => this.menusSignal().length);

  readonly totalLikes = computed(() =>
    this.menusSignal().reduce((sum, m) => sum + (m.likesCount ?? 0), 0)
  );

  constructor(private favorites: MenuFavoritesService) {
  
    const converted = this.convertMockedMenus();
    this.menusSignal.set(converted);
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
    this.menusSignal.update(current => current.filter(m => m.id !== id));
    this.favorites.remove(id);
  }

  toggleFavorite(id: string): void {
    this.menusSignal.update(current =>
      current.map((menu) => {
        if (menu.id !== id) return menu;

        const likesBase = menu.likesCount ?? (menu.favorited ? 1 : 0);
        const newFavorited = !menu.favorited;
        const newLikes = newFavorited
          ? likesBase + 1
          : Math.max(0, likesBase - 1);

        const updated = {
          ...menu,
          favorited: newFavorited,
          likesCount: newLikes,
        };

        if (updated.favorited) {
          this.favorites.add(updated);
        } else {
          this.favorites.remove(updated.id);
        }

        return updated;
      })
    );
  }

  getMenuById(id: string): Menu | undefined {
    return this.menusSignal().find(m => m.id === id);
  }

  getMenusByCategory(categoryId: string): Menu[] {
    return this.menusSignal().filter(m => m.category.id === categoryId);
  }

  private convertMockedMenus(): Menu[] {
    return (initialMenus as any[]).map((c) => ({
      id: String(c.id),
      title: c.title,
      description: c.description,
      cover: c.capa, 
      category: c.category ?? { id: '0', name: 'Sem categoria' },

      recipe: c.receita ?? '', 
      nutritionistTips: c.dicasNutri ?? '',  
      proteins: c.proteinas ?? 0,  
      carbs: c.carboidratos ?? 0,  
      fats: c.gorduras ?? 0,  
      fiber: c.fibras ?? 0,  
      calories: c.calorias ?? 0,  
      favorited: c.favorita ?? false, 
      likesCount: c.likesCount ?? (c.favorita ? 1 : 0),
    })) as Menu[];
  }
}