import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { ModalService } from './modal.service';
import { LoggerService } from '../../../auth/services/logger.service';
import { environment } from '../../../../environments/environment';
import { Video } from '../../types/videos';

describe('ModalService', () => {
  let service: ModalService;
  let httpMock: HttpTestingController;
  let loggerMock: { error: ReturnType<typeof vi.fn> };

  const mockVideo: Video = {
    id: '1',
    title: 'Test Video',
    description: '',
    url: 'http://test.com/video.mp4',
    cover: '',
    category: { id: 'cat-1', name: 'Cat' }, 
    comments: [],
    commentCount: 0,
    views: 0,
    watchTime: 0,
    recipe: '',
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    calories: 0,
    favorited: false,
    likesCount: 0,
  };

  beforeEach(() => {
    loggerMock = { error: vi.fn() };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ModalService,
        { provide: LoggerService, useValue: loggerMock },
      ],
    });

    service = TestBed.inject(ModalService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should start with modal closed', () => {
    expect(service.selectedVideo()).toBeNull();
    expect(service.isModalOpen()).toBe(false);
  });

  it('should open modal and patch view endpoint', () => {
    service.open(mockVideo);

    const req = httpMock.expectOne(`${environment.apiUrl}/videos/${mockVideo.id}/view`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({});
    req.flush(null);

    expect(service.selectedVideo()).toEqual(mockVideo);
    expect(service.isModalOpen()).toBe(true);
  });

  it('should log error if patch view fails and still open modal', () => {
    service.open(mockVideo);

    const req = httpMock.expectOne(`${environment.apiUrl}/videos/${mockVideo.id}/view`);
    req.flush('error', { status: 500, statusText: 'Server Error' });

    expect(loggerMock.error).toHaveBeenCalled();
    expect(service.selectedVideo()).toEqual(mockVideo);
    expect(service.isModalOpen()).toBe(true);
  });

  it('should close modal', () => {
    service.open(mockVideo);

    const req = httpMock.expectOne(`${environment.apiUrl}/videos/${mockVideo.id}/view`);
    req.flush(null);

    expect(service.isModalOpen()).toBe(true);

    service.close();

    expect(service.selectedVideo()).toBeNull();
    expect(service.isModalOpen()).toBe(false);
  });

  it('should check if specific video is open', () => {
    expect(service.isVideoOpen('1')).toBe(false);

    service.open(mockVideo);

    const req = httpMock.expectOne(`${environment.apiUrl}/videos/${mockVideo.id}/view`);
    req.flush(null);

    expect(service.isVideoOpen('1')).toBe(true);
    expect(service.isVideoOpen('2')).toBe(false);

    service.close();
    expect(service.isVideoOpen('1')).toBe(false);
  });
});