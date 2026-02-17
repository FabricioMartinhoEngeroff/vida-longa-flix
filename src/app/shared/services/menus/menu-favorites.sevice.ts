import { Injectable, signal, computed } from '@angular/core';
import { Menu } from '../../types/menu';

@Injectable({ providedIn: 'root' })
export class MenuFavoritesService {
 
  private favoritesSignal = signal<Menu[]>([]);

  readonly favorites = this.favoritesSignal.asReadonly();

  readonly totalFavorites = computed(() => this.favoritesSignal().length);

  listFavorites(): Menu[] {
    return this.favoritesSignal();
  }

  add(menu: Menu): void {
    this.favoritesSignal.update(current => {
      // Evita duplicatas
      if (current.some(fav => fav.id === menu.id)) {
        return current;
      }
      return [...current, menu];
    });
  }

  remove(id: string): void {
    this.favoritesSignal.update(current =>
      current.filter(m => m.id !== id)
    );
  }

  isFavorited(id: string): boolean {
    return this.favoritesSignal().some(m => m.id === id);
  }

  toggle(menu: Menu): void {
    if (this.isFavorited(menu.id)) {
      this.remove(menu.id);
    } else {
      this.add(menu);
    }
  }

  clearAll(): void {
    this.favoritesSignal.set([]);
  }
}