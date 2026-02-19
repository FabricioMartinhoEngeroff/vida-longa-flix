import { TestBed } from '@angular/core/testing';
import { MenuFavoritesService } from './menu-favorites.sevice';
import { Menu } from '../../types/menu';

describe('MenuFavoritesService', () => {
  let service: MenuFavoritesService;

  const mockMenu: Menu = {
    id: '1',
    title: 'Cardapio Teste',
    description: 'Descricao',
    cover: 'capa.jpg',
    category: { id: '1', name: 'Teste' },
    recipe: '',
    nutritionistTips: '',
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    calories: 0
  };

  const mockMenu2: Menu = {
    id: '2',
    title: 'Cardapio 2',
    description: 'Descricao 2',
    cover: 'capa2.jpg',
    category: { id: '2', name: 'Teste 2' },
    recipe: '',
    nutritionistTips: '',
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    calories: 0
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuFavoritesService);
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty favorites', () => {
    expect(service.listFavorites()).toEqual([]);
    expect(service.totalFavorites()).toBe(0);
  });

  it('should add menu to favorites without duplicating', () => {
    service.add(mockMenu);
    service.add(mockMenu);

    expect(service.listFavorites().length).toBe(1);
    expect(service.totalFavorites()).toBe(1);
  });

  it('should remove menu by id', () => {
    service.add(mockMenu);
    service.remove('1');

    expect(service.listFavorites().length).toBe(0);
  });

  it('should check if menu is favorited', () => {
    expect(service.isFavorited('1')).toBe(false);
    
    service.add(mockMenu);
    
    expect(service.isFavorited('1')).toBe(true);
  });

  it('should toggle favorite', () => {
    service.toggle(mockMenu);
    expect(service.isFavorited('1')).toBe(true);
    
    service.toggle(mockMenu);
    expect(service.isFavorited('1')).toBe(false);
  });

  it('should clear all favorites', () => {
    service.add(mockMenu);
    service.add(mockMenu2);
    
    service.clearAll();
    
    expect(service.listFavorites()).toEqual([]);
    expect(service.totalFavorites()).toBe(0);
  });

  it('should update totalFavorites reactively', () => {
    expect(service.totalFavorites()).toBe(0);
    
    service.add(mockMenu);
    expect(service.totalFavorites()).toBe(1);
    
    service.add(mockMenu2);
    expect(service.totalFavorites()).toBe(2);
    
    service.remove('1');
    expect(service.totalFavorites()).toBe(1);
  });
});