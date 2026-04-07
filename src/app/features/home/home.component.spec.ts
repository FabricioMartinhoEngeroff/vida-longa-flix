import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { signal } from '@angular/core';

import { HomeComponent } from './home.component';
import { AuthService } from '../../auth/services/auth.service';
import { CommentsService } from '../../shared/services/comments/comments.service';
import { ModalService } from '../../shared/services/modal/modal.service';
import { VideoService } from '../../shared/services/video/video.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  const videosSignal = signal<any[]>([]);

  const videoServiceMock = {
    videos: videosSignal.asReadonly(),
    toggleFavorite: vi.fn(),
    removeVideo: vi.fn(),
  };

  const modalServiceMock = {
    open: vi.fn(),
    selectedVideo: signal(null).asReadonly(),
  };

  const commentsServiceMock = {
    get: vi.fn((id: string) => {
      const state: Record<string, string[]> = {
        '10': ['Voce: teste'],
      };
      return state[id] ?? [];
    }),
    comments: signal({}).asReadonly(),
    loadByVideo: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    videosSignal.set([]);

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: VideoService, useValue: videoServiceMock },
        { provide: ModalService, useValue: modalServiceMock },
        { provide: CommentsService, useValue: commentsServiceMock },
        { provide: AuthService, useValue: { user$: of({ roles: ['ROLE_ADMIN'] }) } },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should count comments using video key', () => {
    expect(component.getTotalComments('10')).toBe(1);
    expect(component.getTotalComments('99')).toBe(0);
  });

  // ── A15. Card do carrossel sem descricao ────────────────────────

  describe('A15 — Descricao nao deve aparecer no card de video', () => {
    const sampleVideo = {
      id: 'v1',
      title: 'Panqueca de mirtilo',
      description: 'Descricao longa que nao deve aparecer no card',
      url: 'https://cdn.exemplo.com/video.mp4',
      cover: 'https://cdn.exemplo.com/capa.jpg',
      category: { id: 'c1', name: 'Panquecas', type: 'VIDEO' },
      likesCount: 0,
      favorited: false,
    } as any;

    function renderWith(videos: any[]) {
      component.videosByCategory = [
        { nome: 'Panquecas', itens: videos },
      ] as any;
      fixture.changeDetectorRef.detectChanges();
    }

    beforeEach(() => {
      renderWith([sampleVideo]);
    });

    it('#109 card de video no carrossel (desktop) nao exibe descricao', () => {
      const desc = fixture.nativeElement.querySelector('.video-card .description');
      expect(desc).toBeNull();
    });

    it('#110 card de video no carrossel (mobile) nao exibe descricao', () => {
      const desc = fixture.nativeElement.querySelector('.video-card .description');
      expect(desc).toBeNull();
    });

    it('#111 card de video exibe apenas titulo', () => {
      const title = fixture.nativeElement.querySelector('.video-card .info-area h3');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Panqueca de mirtilo');

      const desc = fixture.nativeElement.querySelector('.video-card .description');
      expect(desc).toBeNull();
    });

    it('#112 abrir modal a partir do card passa video completo com descricao', () => {
      component.openModal(sampleVideo);

      expect(modalServiceMock.open).toHaveBeenCalledWith(sampleVideo);
      const arg = (modalServiceMock.open as any).mock.calls[0][0];
      expect(arg.description).toBe('Descricao longa que nao deve aparecer no card');
    });

    it('#113 card sem descricao nao afeta layout — info-area renderiza normalmente', () => {
      const infoArea = fixture.nativeElement.querySelector('.video-card .info-area');
      expect(infoArea).toBeTruthy();
      expect(infoArea.children.length).toBeGreaterThan(0);
    });

    it('#114 video com descricao muito longa nao estoura o card', () => {
      renderWith([{ ...sampleVideo, description: 'A'.repeat(1000) }]);

      const desc = fixture.nativeElement.querySelector('.video-card .description');
      expect(desc).toBeNull();
    });

    it('#115 video com descricao null renderiza card normalmente', () => {
      renderWith([{ ...sampleVideo, description: null as any }]);

      const card = fixture.nativeElement.querySelector('.video-card');
      expect(card).toBeTruthy();

      const desc = fixture.nativeElement.querySelector('.video-card .description');
      expect(desc).toBeNull();
    });

    it('#116 video com descricao undefined renderiza card normalmente', () => {
      renderWith([{ ...sampleVideo, description: undefined as any }]);

      const card = fixture.nativeElement.querySelector('.video-card');
      expect(card).toBeTruthy();

      const title = fixture.nativeElement.querySelector('.video-card .info-area h3');
      expect(title).toBeTruthy();
    });
  });
});
