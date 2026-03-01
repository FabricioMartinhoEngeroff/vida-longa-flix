import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { VideoZoomModalComponent } from './video-zoom-modal.component';

import { signal } from '@angular/core';
import { ModalService } from '../../services/modal/modal.service';
import { VideoService } from '../../services/video/video.service';
import { CommentsService } from '../../services/comments/comments.service';
import { AuthService } from '../../../auth/services/auth.service';
import { of } from 'rxjs';

describe('VideoZoomModalComponent', () => {
  let component: VideoZoomModalComponent;
  let fixture: ComponentFixture<VideoZoomModalComponent>;

  const selectedVideoSignal = signal<any>(null);
  const videosSignal = signal<any[]>([]);

  const modalServiceMock = {
    selectedVideo: selectedVideoSignal.asReadonly(),
    close: vi.fn(),
  };

  const videoServiceMock = {
    videos: videosSignal.asReadonly(),
    toggleFavorite: vi.fn(),
    updateVideo: vi.fn(),
  };

  const commentsStateSignal = signal<Record<string, any[]>>({});

  const commentsServiceMock = {
    get: vi.fn().mockReturnValue([]),
    add: vi.fn(),
    loadByVideo: vi.fn(),
    delete: vi.fn(),
    comments: commentsStateSignal.asReadonly(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [VideoZoomModalComponent],
      providers: [
        { provide: ModalService, useValue: modalServiceMock },
        { provide: VideoService, useValue: videoServiceMock },
        { provide: CommentsService, useValue: commentsServiceMock },
        { provide: AuthService, useValue: { user$: of({ roles: ['ROLE_ADMIN'] }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoZoomModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should add comment with video type', () => {
    component.updatedVideo = { id: '5' } as any;

    component.addComment('test comment');

    expect(commentsServiceMock.add).toHaveBeenCalledWith('5', 'test comment');
  });

  it('should toggle favorite', () => {
    component.updatedVideo = { id: '5' } as any;

    component.toggleFavorite();

    expect(videoServiceMock.toggleFavorite).toHaveBeenCalledWith('5');
  });

  it('should call updateVideo on field save', () => {
    component.updatedVideo = { id: '5' } as any;

    component.onFieldSave('title', 'Novo Título');

    expect(videoServiceMock.updateVideo).toHaveBeenCalledWith('5', { title: 'Novo Título' });
  });

  it('should not call updateVideo when no video selected', () => {
    component.updatedVideo = null;

    component.onFieldSave('title', 'Novo Título');

    expect(videoServiceMock.updateVideo).not.toHaveBeenCalled();
  });
});
