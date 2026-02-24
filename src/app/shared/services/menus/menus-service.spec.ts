import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { MenuService } from './menus-service';
import { FavoritesService } from '../favorites/favorites.service.';


// Mock do novo FavoritesService genérico
class FavoritesServiceMock {
  toggle = vi.fn();
  isFavorited = vi.fn().mockReturnValue(false);
}

describe('MenuService', () => {
  let service: MenuService;
  let favoritesMock: FavoritesServiceMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MenuService,
        { provide: FavoritesService, useClass: FavoritesServiceMock },
      ],
    });

    service = TestBed.inject(MenuService);
    favoritesMock = TestBed.inject(FavoritesService) as any;
  });

  it('should load initial menus from JSON', () => {
    expect(service.menus().length).toBeGreaterThan(0);
  });

  it('should add, update and remove menu', () => {
    const newMenu = {
      id: 'x1', title: 'Novo', description: 'Desc',
      cover: 'capa.jpg', category: { id: '1', name: 'Teste' },
      recipe: '', nutritionistTips: '',
      protein: 0, carbs: 0, fat: 0, fiber: 0,
      calories: 0, favorited: false, likesCount: 0,
    };

    service.add(newMenu as any);
    expect(service.menus()[0].id).toBe('x1');

    service.update({ ...newMenu, title: 'Atualizado' } as any);
    expect(service.menus().find(m => m.id === 'x1')?.title).toBe('Atualizado');

    service.remove('x1');
    expect(service.menus().some(m => m.id === 'x1')).toBe(false);
  });

  it('should toggle favorite — call FavoritesService and update local state', () => {
    const target = {
      id: 'fav-1', title: 'Fav', description: 'Desc',
      cover: 'capa.jpg', category: { id: '1', name: 'Teste' },
      recipe: '', nutritionistTips: '',
      protein: 0, carbs: 0, fat: 0, fiber: 0,
      calories: 0, favorited: false, likesCount: 0,
    };
    service.add(target as any);

    service.toggleFavorite('fav-1');

    expect(favoritesMock.toggle).toHaveBeenCalledWith('fav-1', 'MENU');

    const afterLike = service.menus().find(m => m.id === 'fav-1')!;
    expect(afterLike.favorited).toBe(true);
    expect(afterLike.likesCount).toBe(1);
  });

  it('should decrement likesCount when unfavoriting', () => {
    const target = {
      id: 'fav-2', title: 'Fav2', description: 'Desc',
      cover: 'capa.jpg', category: { id: '1', name: 'Teste' },
      recipe: '', nutritionistTips: '',
      protein: 0, carbs: 0, fat: 0, fiber: 0,
      calories: 0, favorited: false, likesCount: 0,
    };
    service.add(target as any);

    service.toggleFavorite('fav-2');
    service.toggleFavorite('fav-2');

    const afterUnlike = service.menus().find(m => m.id === 'fav-2')!;
    expect(afterUnlike.favorited).toBe(false);
    expect(afterUnlike.likesCount).toBe(0);
    expect(favoritesMock.toggle).toHaveBeenCalledTimes(2);
  });

  it('should get menu by id', () => {
    const first = service.menus()[0];
    expect(service.getMenuById(first.id)).toBeDefined();
  });

  it('should filter menus by category', () => {
    const categoryId = service.menus()[0].category.id;
    const filtered = service.getMenusByCategory(categoryId);
    expect(filtered.every(m => m.category.id === categoryId)).toBe(true);
  });

  it('should update totalLikes reactively', () => {
    const target = {
      id: 'likes-1', title: 'T', description: 'D',
      cover: 'c.jpg', category: { id: '1', name: 'T' },
      recipe: '', nutritionistTips: '',
      protein: 0, carbs: 0, fat: 0, fiber: 0,
      calories: 0, favorited: false, likesCount: 0,
    };
    service.add(target as any);

    const initial = service.totalLikes();
    service.toggleFavorite('likes-1');
    expect(service.totalLikes()).toBe(initial + 1);
  });
});