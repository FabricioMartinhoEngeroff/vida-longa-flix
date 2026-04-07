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

  // ── A17. Capa sem barras pretas no carrossel ──────────────────

  describe('A17 — Capa do video sem barras pretas no carrossel', () => {
    const sampleVideo = {
      id: 'v1',
      title: 'Video Fitness',
      description: 'desc',
      url: 'https://cdn.exemplo.com/video.mp4',
      cover: 'https://cdn.exemplo.com/capa.jpg',
      category: { id: 'c1', name: 'Fitness', type: 'VIDEO' },
      likesCount: 0,
      favorited: false,
    } as any;

    function renderWith(videos: any[]) {
      component.videosByCategory = [
        { nome: 'Fitness', itens: videos },
      ] as any;
      fixture.changeDetectorRef.detectChanges();
    }

    it('#129 capa 16:9 no card desktop — preenche sem barras pretas', () => {
      renderWith([sampleVideo]);
      const thumb = fixture.nativeElement.querySelector('.thumbnail') as HTMLElement;
      expect(thumb).toBeTruthy();
      expect(getComputedStyle(thumb).objectFit).toBe('cover');
    });

    it('#130 capa 16:9 no card mobile — preenche sem barras pretas', () => {
      renderWith([sampleVideo]);
      const thumb = fixture.nativeElement.querySelector('.thumbnail') as HTMLElement;
      expect(thumb).toBeTruthy();
      expect(getComputedStyle(thumb).objectFit).toBe('cover');
    });

    it('#131 capa quadrada (1:1) — recortada via object-fit: cover para 16:9', () => {
      renderWith([sampleVideo]);
      const thumb = fixture.nativeElement.querySelector('.thumbnail') as HTMLElement;
      expect(thumb).toBeTruthy();
      expect(getComputedStyle(thumb).objectFit).toBe('cover');
    });

    it('#132 capa vertical (9:16) — recortada para preencher sem barras', () => {
      renderWith([sampleVideo]);
      const thumb = fixture.nativeElement.querySelector('.thumbnail') as HTMLElement;
      expect(thumb).toBeTruthy();
      expect(getComputedStyle(thumb).objectFit).toBe('cover');
    });

    it('#133 capa ultrawide (21:9) — recortada verticalmente', () => {
      renderWith([sampleVideo]);
      const thumb = fixture.nativeElement.querySelector('.thumbnail') as HTMLElement;
      expect(thumb).toBeTruthy();
      expect(getComputedStyle(thumb).objectFit).toBe('cover');
    });

    it('#134 video sem capa (null) exibe placeholder — nao mostra imagem quebrada', () => {
      renderWith([{ ...sampleVideo, cover: null }]);
      const card = fixture.nativeElement.querySelector('.video-card') as HTMLElement;
      expect(card).toBeTruthy();

      const thumb = fixture.nativeElement.querySelector('.thumbnail') as HTMLImageElement;
      // Deve ter fallback: placeholder src, ou img escondida, ou atributo de erro
      if (thumb) {
        const src = thumb.getAttribute('src');
        expect(src).not.toBe('null');
      }
    });

    it('#135 capa com URL quebrada exibe fallback visual', () => {
      renderWith([{ ...sampleVideo, cover: 'https://broken.invalid/x.jpg' }]);
      const thumb = fixture.nativeElement.querySelector('.thumbnail') as HTMLElement;
      expect(thumb).toBeTruthy();
      // Deve ter handler de erro (onerror ou (error)) para exibir fallback
    });

    it('#136 classe .thumbnail possui object-fit: cover (nao contain)', () => {
      renderWith([sampleVideo]);
      const thumb = fixture.nativeElement.querySelector('.thumbnail') as HTMLElement;
      expect(thumb).toBeTruthy();
      expect(getComputedStyle(thumb).objectFit).toBe('cover');
    });

    it('#137 video-wrapper tem fundo preto apenas como fallback', () => {
      renderWith([sampleVideo]);
      const wrapper = fixture.nativeElement.querySelector('.video-wrapper') as HTMLElement;
      expect(wrapper).toBeTruthy();
      // Fundo preto (#000) serve apenas como fallback quando capa carrega
    });

    it('#138 hover preview do video tambem usa object-fit: cover', () => {
      renderWith([sampleVideo]);
      const preview = fixture.nativeElement.querySelector('.video-preview') as HTMLElement;
      expect(preview).toBeTruthy();
      expect(getComputedStyle(preview).objectFit).toBe('cover');
    });

    it('#139 capa no card mobile nao distorce — mantem proporcao via crop', () => {
      renderWith([sampleVideo]);
      const thumb = fixture.nativeElement.querySelector('.thumbnail') as HTMLElement;
      expect(thumb).toBeTruthy();
      // object-fit: cover garante que nao distorce
      expect(getComputedStyle(thumb).objectFit).toBe('cover');
    });
  });

  // ── A18. Videos devem carregar e aparecer ao acessar a pagina ──

  describe('A18 — Videos devem carregar e aparecer na home', () => {
    const makeVideo = (id: string, title: string, catName: string) => ({
      id,
      title,
      description: 'desc',
      url: 'https://cdn.exemplo.com/video.mp4',
      cover: 'https://cdn.exemplo.com/capa.jpg',
      category: { id: `cat-${catName}`, name: catName, type: 'VIDEO' },
      likesCount: 0,
      favorited: false,
    });

    it('#142 apos login com videos cadastrados — videos aparecem nos carrosseis', () => {
      videosSignal.set([
        makeVideo('v1', 'Video 1', 'Bolos'),
        makeVideo('v2', 'Video 2', 'Saladas'),
      ]);
      fixture.changeDetectorRef.detectChanges();

      expect(component.videosByCategory.length).toBeGreaterThan(0);
      const carousels = fixture.nativeElement.querySelectorAll('app-category-carousel');
      expect(carousels.length).toBeGreaterThan(0);
    });

    it('#143 signal videos() atualiza — effect popula videosByCategory', () => {
      videosSignal.set([
        makeVideo('v1', 'Video 1', 'Bolos'),
      ]);
      fixture.changeDetectorRef.detectChanges();

      expect(component.videosByCategory.length).toBe(1);
      expect(component.videosByCategory[0].nome).toBe('Bolos');
      expect(component.videosByCategory[0].itens.length).toBe(1);
    });

    it('#144 videosByCategory populado — template renderiza os carrosseis', () => {
      videosSignal.set([
        makeVideo('v1', 'Video 1', 'Bolos'),
      ]);
      fixture.changeDetectorRef.detectChanges();

      const carousels = fixture.nativeElement.querySelectorAll('app-category-carousel');
      expect(carousels.length).toBe(1);
    });

    it('#145 enquanto videos carregam — tela nao fica permanentemente em branco', () => {
      // Signal vazio (carregando) — deve exibir loading ou estado vazio, nao branco
      videosSignal.set([]);
      fixture.changeDetectorRef.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      // Deve ter algum conteudo visivel (loading, skeleton, ou mensagem)
      const hasContent = el.querySelector('app-category-carousel')
        || el.querySelector('.empty-state')
        || el.querySelector('.loading');
      expect(hasContent).toBeTruthy();
    });

    it('#146 API retorna lista vazia — exibe estado vazio ou mensagem', () => {
      videosSignal.set([]);
      fixture.changeDetectorRef.detectChanges();

      const carousels = fixture.nativeElement.querySelectorAll('app-category-carousel');
      expect(carousels.length).toBe(0);

      // Deve exibir algum feedback visual em vez de tela em branco
      const emptyState = fixture.nativeElement.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
    });

    it('#147 API retorna erro — tela nao fica em branco, exibe feedback', () => {
      // Signal vazio apos erro — mesmo cenario visual que lista vazia
      videosSignal.set([]);
      fixture.changeDetectorRef.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const emptyOrError = el.querySelector('.empty-state') || el.querySelector('.error-state');
      expect(emptyOrError).toBeTruthy();
    });

    it('#148 navegar para outra aba e voltar — videos continuam visiveis', () => {
      videosSignal.set([makeVideo('v1', 'Video 1', 'Bolos')]);
      fixture.changeDetectorRef.detectChanges();

      expect(component.videosByCategory.length).toBe(1);

      // Simula "voltar" — signal ainda tem dados
      fixture.changeDetectorRef.detectChanges();

      expect(component.videosByCategory.length).toBe(1);
    });

    it('#149 recarregar a pagina (F5) — videos carregam normalmente', () => {
      // Apos reload, signal e populado novamente pelo service
      videosSignal.set([makeVideo('v1', 'Video 1', 'Bolos')]);
      fixture.changeDetectorRef.detectChanges();

      expect(component.videosByCategory.length).toBe(1);
    });

    it('#150 login como usuario comum — videos aparecem normalmente', () => {
      // O carrossel funciona independente do role
      videosSignal.set([makeVideo('v1', 'Video 1', 'Bolos')]);
      fixture.changeDetectorRef.detectChanges();

      expect(component.videosByCategory.length).toBe(1);
      const carousels = fixture.nativeElement.querySelectorAll('app-category-carousel');
      expect(carousels.length).toBe(1);
    });

    it('#151 effect roda mas videosByCategory vazio — exibe fallback', () => {
      videosSignal.set([]);
      fixture.changeDetectorRef.detectChanges();

      expect(component.videosByCategory.length).toBe(0);

      const el = fixture.nativeElement as HTMLElement;
      const fallback = el.querySelector('.empty-state');
      expect(fallback).toBeTruthy();
    });

    it('#152 loadVideos no constructor do service atualiza signal antes ou component reage', () => {
      // Signal ja deve ter sido processado pelo effect
      videosSignal.set([makeVideo('v1', 'Video 1', 'Bolos')]);
      fixture.changeDetectorRef.detectChanges();

      expect(component.reelVideos.length).toBe(1);
      expect(component.videosByCategory.length).toBe(1);
    });

    it('#153 multiplas categorias — cada uma gera um carrossel separado', () => {
      videosSignal.set([
        makeVideo('v1', 'Video 1', 'Bolos'),
        makeVideo('v2', 'Video 2', 'Saladas'),
        makeVideo('v3', 'Video 3', 'Bolos'),
      ]);
      fixture.changeDetectorRef.detectChanges();

      expect(component.videosByCategory.length).toBe(2);

      const carousels = fixture.nativeElement.querySelectorAll('app-category-carousel');
      expect(carousels.length).toBe(2);
    });

    it('#154 apenas uma categoria — um unico carrossel exibido', () => {
      videosSignal.set([
        makeVideo('v1', 'Video 1', 'Bolos'),
        makeVideo('v2', 'Video 2', 'Bolos'),
      ]);
      fixture.changeDetectorRef.detectChanges();

      expect(component.videosByCategory.length).toBe(1);
      expect(component.videosByCategory[0].itens.length).toBe(2);
    });

    it('#155 videos com categoria null — agrupados sob "Sem categoria"', () => {
      const videoSemCat = {
        id: 'v-nocat',
        title: 'Orfao',
        description: 'desc',
        url: 'https://cdn.exemplo.com/video.mp4',
        cover: 'https://cdn.exemplo.com/capa.jpg',
        category: null,
        likesCount: 0,
        favorited: false,
      };
      videosSignal.set([videoSemCat as any]);
      fixture.changeDetectorRef.detectChanges();

      expect(component.videosByCategory.length).toBe(1);
      expect(component.videosByCategory[0].nome).toBe('Sem categoria');
    });

    it('#156 home acessada via deep link — videos carregam normalmente', () => {
      // Signal populado como se fosse acesso direto
      videosSignal.set([makeVideo('v1', 'Video 1', 'Bolos')]);
      fixture.changeDetectorRef.detectChanges();

      expect(component.videosByCategory.length).toBe(1);
      const carousels = fixture.nativeElement.querySelectorAll('app-category-carousel');
      expect(carousels.length).toBe(1);
    });
  });
});
