import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { VideoService } from './video.service';
import { FavoritesService } from '../favorites/favorites.service.';


class FavoritesServiceMock {
  addFavorite = vi.fn();
  removeFavorite = vi.fn();
}

describe('VideoService', () => {
  let service: VideoService;
  let favoritesMock: FavoritesServiceMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VideoService,
        { provide: FavoritesService, useClass: FavoritesServiceMock },
      ],
    });

    service = TestBed.inject(VideoService);
    favoritesMock = TestBed.inject(FavoritesService) as any;
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should load initial videos', () => {
    expect(service.videos().length).toBeGreaterThan(0);
    expect(service.totalVideos()).toBeGreaterThan(0);
  });

  it('should toggle favorite and call favorites service', () => {
    const first = service.videos()[0];
    const id = first.id;

    service.toggleFavorite(id);

    const updated = service.videos().find(v => v.id === id)!;
    if (updated.favorited) {
      expect(favoritesMock.addFavorite).toHaveBeenCalled();
    } else {
      expect(favoritesMock.removeFavorite).toHaveBeenCalled();
    }
  });

  it('should increment and decrement likesCount when toggling favorite', () => {
    const first = service.videos()[0];
    const id = first.id;
    const initialLikes = first.likesCount ?? 0;

    service.toggleFavorite(id);
    const afterLike = service.videos().find(v => v.id === id)!;
    expect(afterLike.likesCount).toBe(initialLikes + 1);

    service.toggleFavorite(id);
    const afterUnlike = service.videos().find(v => v.id === id)!;
    expect(afterUnlike.likesCount).toBe(Math.max(0, initialLikes));
  });

  it('should add new video to the beginning of list', () => {
    const initialCount = service.totalVideos();
    const newVideo: any = {
      id: '999',
      title: 'New Video',
      description: 'Test',
      url: 'http://test.com',
      capa: 'test.jpg',
      category: { id: '1', name: 'Test' },
      comments: [],
      views: 0,
      watchTime: 0
    };

    service.addVideo(newVideo);

    expect(service.totalVideos()).toBe(initialCount + 1);
    expect(service.videos()[0].id).toBe('999');
  });

  it('should remove video by id', () => {
    const first = service.videos()[0];
    const initialCount = service.totalVideos();

    service.removeVideo(first.id);

    expect(service.totalVideos()).toBe(initialCount - 1);
    expect(service.getVideoById(first.id)).toBeUndefined();
  });

  it('should get video by id', () => {
    const first = service.videos()[0];
    const found = service.getVideoById(first.id);

    expect(found).toBeDefined();
    expect(found?.id).toBe(first.id);
  });

  it('should filter videos by category', () => {
    const categoryId = '1';
    const filtered = service.getVideosByCategory(categoryId);

    expect(filtered.every(v => v.category.id === categoryId)).toBe(true);
  });

  it('should update totalLikes reactively', () => {
    const first = service.videos()[0];
    const initialTotal = service.totalLikes();

    service.toggleFavorite(first.id);

    expect(service.totalLikes()).toBeGreaterThan(initialTotal);
  });
});