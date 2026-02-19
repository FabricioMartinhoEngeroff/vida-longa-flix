import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { VideoService } from './video.service';
import { FavoritesService } from '../favorites/favorites.service.';
import { environment } from '../../../../environments/environment';
import { Video, VideoRequest } from '../../types/videos';

class FavoritesServiceMock {
  addFavorite = vi.fn();
  removeFavorite = vi.fn();
}

const mockVideos: Video[] = [
  {
    id: '1',
    title: 'Bolo Fit',
    description: 'Bolo saudável',
    url: 'http://test.com/v1',
    cover: 'cover1.jpg',
    category: { id: '1', name: 'Bolos' },
    comments: [],
    commentCount: 0,
    views: 10,
    watchTime: 5.0,
    recipe: 'Receita do bolo',
    protein: 8,
    carbs: 20,
    fat: 3,
    fiber: 2,
    calories: 150,
    likesCount: 0,
    favorited: false,
  },
  {
    id: '2',
    title: 'Omelete Proteico',
    description: 'Omelete rápido',
    url: 'http://test.com/v2',
    cover: 'cover2.jpg',
    category: { id: '2', name: 'Salgados' },
    comments: [],
    commentCount: 0,
    views: 20,
    watchTime: 3.0,
    recipe: '',
    protein: 15,
    carbs: 2,
    fat: 5,
    fiber: 0,
    calories: 120,
    likesCount: 2,
    favorited: false,
  },
];

describe('VideoService', () => {
  let service: VideoService;
  let httpMock: HttpTestingController;
  let favoritesMock: FavoritesServiceMock;
  const baseUrl = `${environment.apiUrl}/videos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        VideoService,
        { provide: FavoritesService, useClass: FavoritesServiceMock },
      ],
    });

    service = TestBed.inject(VideoService);
    httpMock = TestBed.inject(HttpTestingController);
    favoritesMock = TestBed.inject(FavoritesService) as any;

    // Responde o GET inicial do construtor
    const req = httpMock.expectOne(baseUrl);
    req.flush(mockVideos);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should load videos from backend', () => {
    expect(service.videos().length).toBe(2);
    expect(service.totalVideos()).toBe(2);
  });

  it('should set empty array when backend fails', () => {
    service.loadVideos();
    const req = httpMock.expectOne(baseUrl);
    req.error(new ProgressEvent('error'));

    expect(service.videos().length).toBe(0);
  });

  it('should create video and reload list', () => {
    const request: VideoRequest = {
      title: 'Novo Vídeo',
      description: 'Descrição',
      url: 'http://test.com/new',
      cover: 'cover.jpg',
      categoryId: '1',
      recipe: '',
      protein: 5,
      carbs: 10,
      fat: 2,
      fiber: 1,
      calories: 80,
    };

    service.addVideo(request);

    const postReq = httpMock.expectOne(baseUrl);
    expect(postReq.request.method).toBe('POST');
    expect(postReq.request.body).toEqual(request);
    postReq.flush(null);

    // Responde o reload
    const getReq = httpMock.expectOne(baseUrl);
    getReq.flush([...mockVideos, { ...mockVideos[0], id: '3', title: 'Novo Vídeo' }]);

    expect(service.totalVideos()).toBe(3);
  });

  it('should delete video and reload list', () => {
    service.removeVideo('1');

    const deleteReq = httpMock.expectOne(`${baseUrl}/1`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);

    // Responde o reload
    const getReq = httpMock.expectOne(baseUrl);
    getReq.flush([mockVideos[1]]);

    expect(service.totalVideos()).toBe(1);
    expect(favoritesMock.removeFavorite).toHaveBeenCalledWith('1');
  });

  it('should toggle favorite and call favorites service', () => {
    service.toggleFavorite('1');

    const updated = service.videos().find(v => v.id === '1')!;
    expect(updated.favorited).toBe(true);
    expect(updated.likesCount).toBe(1);
    expect(favoritesMock.addFavorite).toHaveBeenCalled();
  });

  it('should increment and decrement likesCount when toggling', () => {
    service.toggleFavorite('1');
    expect(service.videos().find(v => v.id === '1')!.likesCount).toBe(1);

    service.toggleFavorite('1');
    expect(service.videos().find(v => v.id === '1')!.likesCount).toBe(0);
    expect(favoritesMock.removeFavorite).toHaveBeenCalledWith('1');
  });

  it('should get video by id', () => {
    const found = service.getVideoById('1');
    expect(found).toBeDefined();
    expect(found?.title).toBe('Bolo Fit');
  });

  it('should return undefined for unknown id', () => {
    expect(service.getVideoById('999')).toBeUndefined();
  });

  it('should filter videos by category', () => {
    const filtered = service.getVideosByCategory('1');
    expect(filtered.length).toBe(1);
    expect(filtered[0].category.name).toBe('Bolos');
  });

  it('should update totalLikes reactively', () => {
    const initialTotal = service.totalLikes();
    service.toggleFavorite('1');
    expect(service.totalLikes()).toBe(initialTotal + 1);
  });
});