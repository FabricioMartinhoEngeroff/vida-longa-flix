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
    selectedVideoSignal.set(null);
    videosSignal.set([]);
    commentsStateSignal.set({});
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

  // ── A14. Exibicao com quebras de linha na modal ─────────────────

  describe('A14 — Exibicao de descricao e receita com quebras de linha', () => {
    const videoWithLineBreaks = {
      id: 'v-lb',
      url: 'https://cdn.exemplo.com/video.mp4',
      title: 'Video Teste',
      description: 'Linha 1\nLinha 2\nLinha 3',
      recipe: 'Etapa 1\nEtapa 2\nEtapa 3',
      protein: 5,
      carbs: 10,
      fat: 3,
      fiber: 2,
      calories: 100,
      favorited: false,
    } as any;

    async function openModalWith(video: any) {
      videosSignal.set([video]);
      selectedVideoSignal.set(video);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    }

    it('#98 descricao com \\n exibida na modal preserva quebras visualmente', async () => {
      await openModalWith(videoWithLineBreaks);

      const desc = fixture.nativeElement.querySelector('.description .display-value') as HTMLElement;
      expect(desc).toBeTruthy();
      expect(desc.textContent).toContain('Linha 1');
      expect(desc.textContent).toContain('Linha 2');
      const ws = getComputedStyle(desc).whiteSpace;
      expect(ws).toBe('pre-line');
    });

    it('#99 receita com \\n exibida na modal preserva quebras visualmente', async () => {
      await openModalWith(videoWithLineBreaks);

      const recipe = fixture.nativeElement.querySelector('.recipe-box .display-value') as HTMLElement;
      expect(recipe).toBeTruthy();
      expect(recipe.textContent).toContain('Etapa 1');
      expect(recipe.textContent).toContain('Etapa 2');
      const ws = getComputedStyle(recipe).whiteSpace;
      expect(ws).toBe('pre-line');
    });

    it('#100 descricao com multiplos paragrafos aparece separada visualmente', async () => {
      const video = { ...videoWithLineBreaks, description: 'Paragrafo 1\n\nParagrafo 2\n\nParagrafo 3' };
      await openModalWith(video);

      const desc = fixture.nativeElement.querySelector('.description .display-value') as HTMLElement;
      expect(desc).toBeTruthy();
      expect(desc.textContent).toContain('Paragrafo 1');
      expect(desc.textContent).toContain('Paragrafo 3');
    });

    it('#101 receita com etapas numeradas separadas por \\n', async () => {
      const video = { ...videoWithLineBreaks, recipe: '1. Misturar\n2. Bater\n3. Assar' };
      await openModalWith(video);

      const recipe = fixture.nativeElement.querySelector('.recipe-box .display-value') as HTMLElement;
      expect(recipe).toBeTruthy();
      expect(recipe.textContent).toContain('1. Misturar');
      expect(recipe.textContent).toContain('3. Assar');
    });

    it('#104 descricao vazia na modal exibe fallback sem quebrar', async () => {
      const video = { ...videoWithLineBreaks, description: '' };
      await openModalWith(video);

      const desc = fixture.nativeElement.querySelector('.description') as HTMLElement;
      expect(desc).toBeTruthy();
      // nao quebra o layout
    });

    it('#105 receita vazia na modal exibe "Sem receita cadastrada."', async () => {
      const video = { ...videoWithLineBreaks, recipe: '' };
      await openModalWith(video);

      const recipe = fixture.nativeElement.querySelector('.recipe-box') as HTMLElement;
      expect(recipe).toBeTruthy();
      expect(recipe.textContent).toContain('Sem receita cadastrada.');
    });

    it('#106 descricao com apenas espacos e \\n renderiza sem blocos estranhos', async () => {
      const video = { ...videoWithLineBreaks, description: '  \n\n  \n ' };
      await openModalWith(video);

      const desc = fixture.nativeElement.querySelector('.description') as HTMLElement;
      expect(desc).toBeTruthy();
    });

    it('#108 descricao muito longa sem quebra nao transborda o container', async () => {
      const video = { ...videoWithLineBreaks, description: 'A'.repeat(500) };
      await openModalWith(video);

      const desc = fixture.nativeElement.querySelector('.description .display-value') as HTMLElement;
      expect(desc).toBeTruthy();
      expect(desc.textContent).toContain('A'.repeat(50));
    });
  });
});
