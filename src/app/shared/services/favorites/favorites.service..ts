import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  FavoriteDTO,
  FavoriteStatusDTO,
  ItemType,
  ToggleResponseDTO,
} from '../../types/favorite';

@Injectable({ providedIn: 'root' })
export class FavoritesService {

  private readonly baseUrl = `${environment.apiUrl}/favorites`;

  private favoritesSignal = signal<FavoriteDTO[]>([]);

  readonly favorites = this.favoritesSignal.asReadonly();

  readonly totalFavorites = computed(() => this.favoritesSignal().length);

  readonly videoFavorites = computed(() =>
    this.favoritesSignal().filter(f => f.itemType === 'VIDEO')
  );

  readonly menuFavorites = computed(() =>
    this.favoritesSignal().filter(f => f.itemType === 'MENU')
  );

  byType(type: ItemType) {
    return computed(() =>
      this.favoritesSignal().filter(f => f.itemType === type)
    );
  }

  constructor(private http: HttpClient) {}

  load(): void {
    this.http.get<FavoriteDTO[]>(this.baseUrl).pipe(
      catchError(() => of([]))
    ).subscribe(favorites => this.favoritesSignal.set(favorites));
  }

  loadByType(type: ItemType): void {
    this.http.get<FavoriteDTO[]>(`${this.baseUrl}/${type}`).pipe(
      catchError(() => of([]))
    ).subscribe(favorites => {
      this.favoritesSignal.update(current => [
        ...current.filter(f => f.itemType !== type),
        ...favorites
      ]);
    });
  }

  toggle(itemId: string, type: ItemType): void {
    this.http.post<ToggleResponseDTO>(
      `${this.baseUrl}/${type}/${itemId}`, {}
    ).pipe(
      catchError(() => of(null))
    ).subscribe(response => {
      if (!response) return;

      if (response.favorited) {
        this.favoritesSignal.update(current => [
          ...current,
          {
            itemId: response.itemId,
            itemType: response.itemType,
            createdAt: new Date().toISOString()
          }
        ]);
      } else {
        this.favoritesSignal.update(current =>
          current.filter(f =>
            !(f.itemId === itemId && f.itemType === type)
          )
        );
      }
    });
  }

  isFavorited(itemId: string, type: ItemType): boolean {
    return this.favoritesSignal().some(
      f => f.itemId === itemId && f.itemType === type
    );
  }

  getStatus(itemId: string, type: ItemType) {
    return this.http.get<FavoriteStatusDTO>(
      `${this.baseUrl}/${type}/${itemId}/status`
    ).pipe(catchError(() => of({ favorited: false, likesCount: 0 })));
  }

  clear(): void {
    this.favoritesSignal.set([]);
  }
}