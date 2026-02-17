import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { MenuService } from './menus-service';
import { MenuFavoritesService } from './menu-favorites.sevice';


describe('MenuService', () => {
  let service: MenuService;

  const favoritesMock = {
    add: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(() => {
    favoritesMock.add.mockReset();
    favoritesMock.remove.mockReset();

    TestBed.configureTestingModule({
      providers: [
        MenuService,
        { provide: MenuFavoritesService, useValue: favoritesMock },
      ],
    });

    service = TestBed.inject(MenuService);
  });

  it('should load initial menus', () => {
    expect(service.menus().length).toBeGreaterThan(0);  
  });

  it('should add, update and remove menu', () => {
    const newMenu = {
      id: 'x1',
      title: 'Novo',
      description: 'Desc',
      cover: 'capa.jpg',
      category: { id: '1', name: 'Teste' },
      recipe: '',
      nutritionistTips: '',
      proteins: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      calories: 0,
      favorited: false,
      likesCount: 0,
    };

    service.add(newMenu as any);
    expect(service.menus()[0].id).toBe('x1');  

    service.update({ ...newMenu, title: 'Atualizado' } as any);
    expect(service.menus().find((c) => c.id === 'x1')?.title).toBe('Atualizado'); 

    service.remove('x1');
    expect(service.menus().some((c) => c.id === 'x1')).toBe(false);  
  });

  it('should toggle favorite, update likes and call favorites service', () => {
    const target = {
      id: 'fav-1',
      title: 'Fav',
      description: 'Desc',
      cover: 'capa.jpg',
      category: { id: '1', name: 'Teste' },
      recipe: '',
      nutritionistTips: '',
      proteins: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      calories: 0,
      favorited: false,
      likesCount: 0,
    };
    service.add(target as any);

    service.toggleFavorite('fav-1');
    const afterLike = service.menus().find((c) => c.id === 'fav-1')!;  
    expect(afterLike.favorited).toBe(true);  
    expect(afterLike.likesCount).toBe(1);
    expect(favoritesMock.add).toHaveBeenCalled();  

    service.toggleFavorite('fav-1');
    const afterUnlike = service.menus().find((c) => c.id === 'fav-1')!;  
    expect(afterUnlike.favorited).toBe(false);  
    expect(afterUnlike.likesCount).toBe(0);
    expect(favoritesMock.remove).toHaveBeenCalledWith('fav-1'); 
  });

  it('should get menu by id', () => {
    const menu = service.getMenuById(service.menus()[0].id);  
    expect(menu).toBeDefined();
  });

  it('should filter menus by category', () => {
    const categoryId = '1';
    const filtered = service.getMenusByCategory(categoryId);
    expect(filtered.every(m => m.category.id === categoryId)).toBe(true);
  });
});