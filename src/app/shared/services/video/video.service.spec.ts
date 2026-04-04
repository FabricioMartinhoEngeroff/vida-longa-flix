import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { VideoService } from './video.service';
import { LoggerService } from '../../../auth/services/logger.service';
import { environment } from '../../../../environments/environment';
import { Video, VideoRequest } from '../../types/videos';
import { FavoritesService } from '../favorites/favorites.service.';
import { ContentNotificationsService } from '../notifications/content-notifications.service';

const baseUrl = `${environment.apiUrl}/videos`;
const adminUrl = `${environment.apiUrl}/admin/videos`;

class FavoritesServiceMock {
  toggle = vi.fn();
  isFavorited = vi.fn().mockReturnValue(false);
}

class LoggerServiceMock {
  error = vi.fn();
}

class NotificationsMock {
  add = vi.fn();
}

const mockVideos: Video[] = [
  {
    id: '1', title: 'Bolo Fit', description: 'Bolo saudável',
    url: 'http://test.com/v1', cover: 'cover1.jpg',
    category: { id: '1', name: 'Bolos' },
    comments: [], commentCount: 0, views: 10, watchTime: 5.0,
    recipe: '', protein: 8, carbs: 20, fat: 3, fiber: 2,
    calories: 150, likesCount: 0, favorited: false,
  },
  {
    id: '2', title: 'Omelete Proteico', description: 'Omelete rápido',
    url: 'http://test.com/v2', cover: 'cover2.jpg',
    category: { id: '2', name: 'Salgados' },
    comments: [], commentCount: 0, views: 20, watchTime: 3.0,
    recipe: '', protein: 15, carbs: 2, fat: 5, fiber: 0,
    calories: 120, likesCount: 2, favorited: false,
  },
];

describe('VideoService', () => {
  let service: VideoService;
  let httpMock: HttpTestingController;
  let favoritesMock: FavoritesServiceMock;
  let notificationsMock: NotificationsMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        VideoService,
        { provide: FavoritesService, useClass: FavoritesServiceMock },
        { provide: LoggerService, useClass: LoggerServiceMock },
        { provide: ContentNotificationsService, useClass: NotificationsMock },
      ],
    });

    service = TestBed.inject(VideoService);
    httpMock = TestBed.inject(HttpTestingController);
    favoritesMock = TestBed.inject(FavoritesService) as any;
    notificationsMock = TestBed.inject(ContentNotificationsService) as any;

    httpMock.expectOne(baseUrl).flush(mockVideos);
  });

  afterEach(() => httpMock.verify());

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should load videos from backend', () => {
    expect(service.videos().length).toBe(2);
    expect(service.totalVideos()).toBe(2);
  });

  it('should set empty array when backend fails', () => {
    service.loadVideos();
    httpMock.expectOne(baseUrl).error(new ProgressEvent('error'));
    expect(service.videos().length).toBe(0);
  });

  it('should create video and reload list', () => {
    const request: VideoRequest = {
      title: 'Novo Vídeo', description: 'Descrição',
      url: 'http://test.com/new', cover: 'cover.jpg',
      categoryId: '1', recipe: '',
      protein: 5, carbs: 10, fat: 2, fiber: 1, calories: 80,
    };

    service.addVideo(request);

    // POST vai para rota admin
    const postReq = httpMock.expectOne(adminUrl);
    expect(postReq.request.method).toBe('POST');
    postReq.flush(null);

    httpMock.expectOne(baseUrl).flush([
      ...mockVideos,
      { ...mockVideos[0], id: '3', title: 'Novo Vídeo' }
    ]);

    expect(notificationsMock.add).toHaveBeenCalledWith('VIDEO', 'Novo Vídeo');
    expect(service.totalVideos()).toBe(3);
  });

  it('should create video with multipart upload and reload list', () => {
    const request: VideoRequest = {
      title: 'Novo Vídeo Upload', description: 'Descrição',
      url: 'video.mp4', cover: 'cover.jpg',
      categoryId: '1', recipe: 'Receita',
      protein: 5, carbs: 10, fat: 2, fiber: 1, calories: 80,
    };
    const videoFile = new File(['video'], 'video.mp4', { type: 'video/mp4' });
    const coverFile = new File(['cover'], 'cover.jpg', { type: 'image/jpeg' });

    service.addVideoWithFiles(request, videoFile, coverFile);

    const postReq = httpMock.expectOne(adminUrl);
    expect(postReq.request.method).toBe('POST');
    expect(postReq.request.body instanceof FormData).toBe(true);

    const formData = postReq.request.body as FormData;
    expect(formData.get('video')).toBeTruthy();
    expect(formData.get('cover')).toBeTruthy();
    expect(formData.get('title')).toBe('Novo Vídeo Upload');
    expect(formData.get('description')).toBe('Descrição');
    expect(formData.get('categoryId')).toBe('1');
    expect(formData.get('recipe')).toBe('Receita');
    expect(formData.get('protein')).toBe('5');
    expect(formData.get('carbs')).toBe('10');
    expect(formData.get('fat')).toBe('2');
    expect(formData.get('fiber')).toBe('1');
    expect(formData.get('calories')).toBe('80');
    postReq.flush(null);

    httpMock.expectOne(baseUrl).flush([
      ...mockVideos,
      { ...mockVideos[0], id: '3', title: 'Novo Vídeo Upload' }
    ]);

    expect(notificationsMock.add).toHaveBeenCalledWith('VIDEO', 'Novo Vídeo Upload');
    expect(service.totalVideos()).toBe(3);
  });

  it('should create video with multipart upload without cover file', () => {
    const request: VideoRequest = {
      title: 'Vídeo Sem Capa', description: 'Descrição',
      url: 'video.mp4', cover: 'video.mp4',
      categoryId: '1', recipe: '',
      protein: 0, carbs: 0, fat: 0, fiber: 0, calories: 0,
    };
    const videoFile = new File(['video'], 'video.mp4', { type: 'video/mp4' });

    service.addVideoWithFiles(request, videoFile);

    const postReq = httpMock.expectOne(adminUrl);
    const formData = postReq.request.body as FormData;
    expect(postReq.request.body instanceof FormData).toBe(true);
    expect(formData.get('video')).toBeTruthy();
    expect(formData.get('cover')).toBeNull();
    postReq.flush(null);

    httpMock.expectOne(baseUrl).flush([
      ...mockVideos,
      { ...mockVideos[0], id: '3', title: 'Vídeo Sem Capa' }
    ]);
  });

  it('should update video and reload list', () => {
    service.updateVideo('1', { title: 'Bolo Fit Editado' });

    const putReq = httpMock.expectOne(`${adminUrl}/1`);
    expect(putReq.request.method).toBe('PUT');
    expect(putReq.request.body).toEqual({ title: 'Bolo Fit Editado' });
    putReq.flush(null);

    httpMock.expectOne(baseUrl).flush([
      { ...mockVideos[0], title: 'Bolo Fit Editado' },
      mockVideos[1],
    ]);

    expect(service.getVideoById('1')?.title).toBe('Bolo Fit Editado');
  });

  it('should optimistically remove video and keep removed on success', () => {
    service.removeVideo('1');
    expect(service.totalVideos()).toBe(1);

    const deleteReq = httpMock.expectOne(`${adminUrl}/1`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);

    expect(service.totalVideos()).toBe(1);
  });

  it('should rollback optimistic removal when backend delete fails', () => {
    service.removeVideo('1');
    expect(service.totalVideos()).toBe(1);

    const deleteReq = httpMock.expectOne(`${adminUrl}/1`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });

    expect(service.totalVideos()).toBe(2);
    expect(service.getVideoById('1')).toBeTruthy();
  });

  it('should toggle favorite — call FavoritesService and update local state', () => {
    service.toggleFavorite('1');

    expect(favoritesMock.toggle).toHaveBeenCalledWith('1', 'VIDEO');

    const updated = service.videos().find(v => v.id === '1')!;
    expect(updated.favorited).toBe(true);
    expect(updated.likesCount).toBe(1);
  });

  it('should decrement likesCount when unfavoriting', () => {
    service.toggleFavorite('1');
    service.toggleFavorite('1');

    const updated = service.videos().find(v => v.id === '1')!;
    expect(updated.favorited).toBe(false);
    expect(updated.likesCount).toBe(0);
    expect(favoritesMock.toggle).toHaveBeenCalledTimes(2);
  });

  it('should get video by id', () => {
    expect(service.getVideoById('1')?.title).toBe('Bolo Fit');
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
    const initial = service.totalLikes();
    service.toggleFavorite('1');
    expect(service.totalLikes()).toBe(initial + 1);
  });
});
