import { Injectable, signal, computed } from '@angular/core';
import { Video } from '../../types/videos';



@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  
  private favoritesSignal = signal<Video[]>([]);

  readonly favorites = this.favoritesSignal.asReadonly();

  readonly totalFavorites = computed(() => this.favoritesSignal().length);

  listFavorites(): Video[] {
    return this.favoritesSignal();
  }

  addFavorite(video: Video): void {
    this.favoritesSignal.update(current => {
      if (current.some(fav => fav.id === video.id)) {
        return current;
      }
      return [...current, video];
    });
  }

  removeFavorite(id: string): void {
    this.favoritesSignal.update(current =>
      current.filter(v => v.id !== id)
    );
  }


  isFavorited(id: string): boolean {
    return this.favoritesSignal().some(v => v.id === id);
  }

  
  toggleFavorite(video: Video): void {
    if (this.isFavorited(video.id)) {
      this.removeFavorite(video.id);
    } else {
      this.addFavorite(video);
    }
  }

  clearAll(): void {
    this.favoritesSignal.set([]);
  }
}