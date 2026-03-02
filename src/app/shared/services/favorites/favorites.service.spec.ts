import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { FavoriteDTO } from '../../types/favorite';
import { environment } from '../../../../environments/environment';
import { FavoritesService } from './favorites.service.';

const baseUrl = `${environment.apiUrl}/favorites`;

const mockFavorites: FavoriteDTO[] = [
  { itemId: '1', itemType: 'VIDEO', createdAt: new Date().toISOString() },
  { itemId: '2', itemType: 'MENU', createdAt: new Date().toISOString() },
];

describe('FavoritesService', () => {
  let service: FavoritesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FavoritesService],
    });

    service = TestBed.inject(FavoritesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty favorites', () => {
    expect(service.favorites().length).toBe(0);
    expect(service.totalFavorites()).toBe(0);
  });

  it('should load all favorites from backend', () => {
    service.load();

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockFavorites);

    expect(service.favorites().length).toBe(2);
    expect(service.totalFavorites()).toBe(2);
  });

  it('should separate video and menu favorites via computed', () => {
    service.load();
    httpMock.expectOne(baseUrl).flush(mockFavorites);

    expect(service.videoFavorites().length).toBe(1);
    expect(service.videoFavorites()[0].itemId).toBe('1');
    expect(service.menuFavorites().length).toBe(1);
    expect(service.menuFavorites()[0].itemId).toBe('2');
  });

  it('should load favorites by type', () => {
    service.loadByType('VIDEO');

    const req = httpMock.expectOne(`${baseUrl}/VIDEO`);
    req.flush([mockFavorites[0]]);

    expect(service.videoFavorites().length).toBe(1);
  });

  it('should add favorite on toggle when not favorited', () => {
    service.toggle('3', 'VIDEO');

    const req = httpMock.expectOne(`${baseUrl}/VIDEO/3`);
    req.flush({ favorited: true, itemId: '3', itemType: 'VIDEO' });

    expect(service.isFavorited('3', 'VIDEO')).toBe(true);
    expect(service.videoFavorites().length).toBe(1);
  });

  it('should remove favorite on toggle when already favorited', () => {
    service.load();
    httpMock.expectOne(baseUrl).flush([mockFavorites[0]]);
    expect(service.isFavorited('1', 'VIDEO')).toBe(true);

    service.toggle('1', 'VIDEO');
    const req = httpMock.expectOne(`${baseUrl}/VIDEO/1`);
    req.flush({ favorited: false, itemId: '1', itemType: 'VIDEO' });

    expect(service.isFavorited('1', 'VIDEO')).toBe(false);
    expect(service.videoFavorites().length).toBe(0);
  });

  it('should not change state when toggle fails', () => {
    service.toggle('1', 'VIDEO');
    const req = httpMock.expectOne(`${baseUrl}/VIDEO/1`);
    req.error(new ProgressEvent('error'));

    expect(service.isFavorited('1', 'VIDEO')).toBe(false);
  });

  it('should check isFavorited correctly', () => {
    service.load();
    httpMock.expectOne(baseUrl).flush(mockFavorites);

    expect(service.isFavorited('1', 'VIDEO')).toBe(true);
    expect(service.isFavorited('1', 'MENU')).toBe(false);
    expect(service.isFavorited('99', 'VIDEO')).toBe(false);
  });

  it('should filter by type via byType()', () => {
    service.load();
    httpMock.expectOne(baseUrl).flush(mockFavorites);

    const videoFavs = service.byType('VIDEO')();
    expect(videoFavs.length).toBe(1);
    expect(videoFavs[0].itemId).toBe('1');
  });

  it('should clear all favorites', () => {
    service.load();
    httpMock.expectOne(baseUrl).flush(mockFavorites);

    service.clear();
    expect(service.favorites().length).toBe(0);
    expect(service.totalFavorites()).toBe(0);
  });

  it('should set empty array when load fails', () => {
    service.load();
    httpMock.expectOne(baseUrl).error(new ProgressEvent('error'));
    expect(service.favorites().length).toBe(0);
  });
});