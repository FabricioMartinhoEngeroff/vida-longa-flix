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
    get: vi.fn(),
    add: vi.fn(),
    loadByVideo: vi.fn(),
    delete: vi.fn(),
    comments: commentsStateSignal.asReadonly(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    selectedVideoSignal.set(null);
    videosSignal.set([]);
    commentsStateSignal.set({});
    commentsServiceMock.get.mockImplementation((videoId: string) => (
      commentsStateSignal()[`video:${videoId}`] ?? []
    ));
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

  it('should allow submitting 5 comments on a mobile-sized viewport', async () => {
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
    window.dispatchEvent(new Event('resize'));

    const video = {
      id: 'video-1',
      url: 'http://test/video.mp4',
      title: 't',
      description: 'd',
      recipe: 'r',
      protein: 1,
      carbs: 1,
      fat: 1,
      fiber: 1,
      calories: 1,
      favorited: false,
    } as any;

    videosSignal.set([video]);
    selectedVideoSignal.set(video);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('.comment-form input') as HTMLInputElement;
    const button = el.querySelector('.comment-form button') as HTMLButtonElement;

    expect(input).toBeTruthy();
    expect(button).toBeTruthy();

    for (let i = 1; i <= 5; i++) {
      input.value = `comment ${i}`;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();

      button.click();
      fixture.detectChanges();
      await fixture.whenStable();
    }

    expect(commentsServiceMock.add).toHaveBeenCalledTimes(5);
    const calls = (commentsServiceMock.add as any).mock.calls as unknown[][];
    expect(calls[0]).toEqual(['video-1', 'comment 1']);
    expect(calls[4]).toEqual(['video-1', 'comment 5']);

    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true });
    window.dispatchEvent(new Event('resize'));
  });

  it('should submit comment on Enter keypress (comment input)', async () => {
    const video = {
      id: 'video-1',
      url: 'http://test/video.mp4',
      title: 't',
      description: 'd',
      recipe: 'r',
      protein: 1,
      carbs: 1,
      fat: 1,
      fiber: 1,
      calories: 1,
      favorited: false,
    } as any;

    videosSignal.set([video]);
    selectedVideoSignal.set(video);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('.comment-form input') as HTMLInputElement;
    expect(input).toBeTruthy();

    input.value = 'via enter';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(commentsServiceMock.add).toHaveBeenCalledWith('video-1', 'via enter');
  });

  it('should not close modal when publishing a comment', async () => {
    const video = {
      id: 'video-1',
      url: 'http://test/video.mp4',
      title: 't',
      description: 'd',
      recipe: 'r',
      protein: 1,
      carbs: 1,
      fat: 1,
      fiber: 1,
      calories: 1,
      favorited: false,
    } as any;

    videosSignal.set([video]);
    selectedVideoSignal.set(video);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('.comment-form input') as HTMLInputElement;
    const button = el.querySelector('.comment-form button') as HTMLButtonElement;
    expect(input).toBeTruthy();
    expect(button).toBeTruthy();

    input.value = 'should not close';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    button.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(modalServiceMock.close).not.toHaveBeenCalled();
  });

  it('should refresh visible comments when the service state receives a second comment', async () => {
    const video = {
      id: 'video-1',
      url: 'http://test/video.mp4',
      title: 't',
      description: 'd',
      recipe: 'r',
      protein: 1,
      carbs: 1,
      fat: 1,
      fiber: 1,
      calories: 1,
      favorited: false,
    } as any;

    const firstComment = { id: '1', text: 'primeiro', date: '2024-01-01', user: { id: 'u1', name: 'Ana' } };
    const secondComment = { id: '2', text: 'segundo', date: '2024-01-02', user: { id: 'u1', name: 'Ana' } };

    videosSignal.set([video]);
    selectedVideoSignal.set(video);
    fixture.detectChanges();
    await fixture.whenStable();

    commentsStateSignal.set({ 'video:video-1': [firstComment] });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.commentItems.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('primeiro');

    commentsStateSignal.set({ 'video:video-1': [firstComment, secondComment] });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.commentItems.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('segundo');
  });
});
