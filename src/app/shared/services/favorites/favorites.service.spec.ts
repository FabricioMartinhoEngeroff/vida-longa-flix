import { TestBed } from '@angular/core/testing';
import { FavoritesService } from './favorites.service.';
import { Video } from '../../types/videos';


describe('FavoritesService', () => {
  let service: FavoritesService;

  const mockVideo1: Video = {
    id: '1',
    title: 'Video 1',
    description: 'Description 1',
    url: 'url1',
    capa: 'capa1.jpg',
    category: { id: 'cat1', name: 'Category 1' },
    comments: [],
    views: 0,
    watchTime: 0
  };

  const mockVideo2: Video = {
    id: '2',
    title: 'Video 2',
    description: 'Description 2',
    url: 'url2',
    capa: 'capa2.jpg',
    category: { id: 'cat2', name: 'Category 2' },
    comments: [],
    views: 0,
    watchTime: 0
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavoritesService);
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty favorites', () => {
    expect(service.listFavorites()).toEqual([]);
    expect(service.totalFavorites()).toBe(0);
  });

  it('should add video to favorites', () => {
    service.addFavorite(mockVideo1);
    
    expect(service.listFavorites().length).toBe(1);
    expect(service.listFavorites()[0].id).toBe('1');
    expect(service.totalFavorites()).toBe(1);
  });

  it('should not add duplicate video', () => {
    service.addFavorite(mockVideo1);
    service.addFavorite(mockVideo1);
    
    expect(service.listFavorites().length).toBe(1);
  });

  it('should remove video from favorites', () => {
    service.addFavorite(mockVideo1);
    service.addFavorite(mockVideo2);
    
    service.removeFavorite('1');
    
    expect(service.listFavorites().length).toBe(1);
    expect(service.listFavorites()[0].id).toBe('2');
  });

  it('should check if video is favorited', () => {
    expect(service.isFavorited('1')).toBe(false);
    
    service.addFavorite(mockVideo1);
    
    expect(service.isFavorited('1')).toBe(true);
    expect(service.isFavorited('2')).toBe(false);
  });

  it('should toggle favorite', () => {
    service.toggleFavorite(mockVideo1);
    expect(service.isFavorited('1')).toBe(true);
    
    service.toggleFavorite(mockVideo1);
    expect(service.isFavorited('1')).toBe(false);
  });

  it('should clear all favorites', () => {
    service.addFavorite(mockVideo1);
    service.addFavorite(mockVideo2);
    
    service.clearAll();
    
    expect(service.listFavorites()).toEqual([]);
    expect(service.totalFavorites()).toBe(0);
  });

  it('should update totalFavorites reactively', () => {
    expect(service.totalFavorites()).toBe(0);
    
    service.addFavorite(mockVideo1);
    expect(service.totalFavorites()).toBe(1);
    
    service.addFavorite(mockVideo2);
    expect(service.totalFavorites()).toBe(2);
    
    service.removeFavorite('1');
    expect(service.totalFavorites()).toBe(1);
  });
});