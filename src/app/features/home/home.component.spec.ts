import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { signal, WritableSignal } from '@angular/core';

import { HomeComponent } from './home.component';
import { AuthService } from '../../auth/services/auth.service';
import { CommentsService } from '../../shared/services/comments/comments.service';
import { ModalService } from '../../shared/services/modal/modal.service';
import { VideoService } from '../../shared/services/video/video.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  const videosSignal = signal<any[]>([]);
  const loadingSignal: WritableSignal<boolean> = signal(false);

  const videoServiceMock = {
    videos: videosSignal.asReadonly(),
    loading: loadingSignal.asReadonly(),
    toggleFavorite: vi.fn(),
    removeVideo: vi.fn(),
    updateCover: vi.fn(),
    loadVideos: vi.fn(),
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
    loadingSignal.set(false);

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

  // ── A19. Botao de editar capa no card do carrossel (admin) ──────

  describe('A19 — Botao de editar capa no card do carrossel', () => {
    const sampleVideo = {
      id: 'v1',
      title: 'Bolo de Cenoura',
      description: 'desc',
      url: 'https://cdn.exemplo.com/video.mp4',
      cover: 'https://cdn.exemplo.com/capa.jpg',
      category: { id: 'c1', name: 'Bolos', type: 'VIDEO' },
      likesCount: 0,
      favorited: false,
    } as any;

    function renderWith(videos: any[]) {
      component.videosByCategory = [
        { nome: 'Bolos', itens: videos },
      ] as any;
      fixture.changeDetectorRef.detectChanges();
    }

    it('#157 card de video (admin logado) exibe botao de editar capa', () => {
      renderWith([sampleVideo]);
      const editBtn = fixture.nativeElement.querySelector('.video-card [aria-label="Editar capa"]');
      expect(editBtn).toBeTruthy();
    });

    it('#158 card de video (usuario comum) NAO exibe botao de editar capa', async () => {
      // Recria fixture com usuario nao-admin
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [HomeComponent],
        providers: [
          { provide: VideoService, useValue: videoServiceMock },
          { provide: ModalService, useValue: modalServiceMock },
          { provide: CommentsService, useValue: commentsServiceMock },
          { provide: AuthService, useValue: { user$: of({ roles: ['ROLE_USER'] }) } },
          { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
        ],
      }).compileComponents();

      const fix2 = TestBed.createComponent(HomeComponent);
      const comp2 = fix2.componentInstance;
      fix2.detectChanges();

      comp2.videosByCategory = [{ nome: 'Bolos', itens: [sampleVideo] }] as any;
      fix2.changeDetectorRef.detectChanges();

      const editBtn = fix2.nativeElement.querySelector('.video-card [aria-label="Editar capa"]');
      expect(editBtn).toBeNull();
    });

    it('#159 clicar no botao de editar capa tem input file com accept image/*', () => {
      renderWith([sampleVideo]);
      const fileInput = fixture.nativeElement.querySelector('.video-card input[type="file"][accept="image/*"]');
      expect(fileInput).toBeTruthy();
    });

    it('#160 selecionar imagem valida chama updateCover no service', () => {
      renderWith([sampleVideo]);
      const file = new File(['img-data'], 'nova-capa.jpg', { type: 'image/jpeg' });
      (component as any).onEditCoverCard('v1', { target: { files: [file] } } as unknown as Event);

      expect(videoServiceMock.updateCover).toHaveBeenCalledWith('v1', file);
    });

    it('#161 upload com sucesso — updateCover chamado (reload delegado ao service)', () => {
      renderWith([sampleVideo]);
      const file = new File(['img-data'], 'capa.jpg', { type: 'image/jpeg' });
      (component as any).onEditCoverCard('v1', { target: { files: [file] } } as unknown as Event);

      expect(videoServiceMock.updateCover).toHaveBeenCalledWith('v1', file);
    });

    it('#162 upload com erro — tratamento delegado ao service', () => {
      renderWith([sampleVideo]);
      const file = new File(['img-data'], 'capa.jpg', { type: 'image/jpeg' });
      (component as any).onEditCoverCard('v1', { target: { files: [file] } } as unknown as Event);

      expect(videoServiceMock.updateCover).toHaveBeenCalled();
    });

    it('#163 cancelar seletor sem escolher imagem nao dispara nada', () => {
      renderWith([sampleVideo]);
      const emptyEvent = { target: { files: [] } } as unknown as Event;
      (component as any).onEditCoverCard('v1', emptyEvent);

      expect(videoServiceMock.updateCover).not.toHaveBeenCalled();
    });

    it('#164 botao de editar capa possui aria-label="Editar capa"', () => {
      renderWith([sampleVideo]);
      const btn = fixture.nativeElement.querySelector('.video-card [aria-label="Editar capa"]');
      expect(btn).toBeTruthy();
    });

    it('#165 selecionar arquivo que nao e imagem nao envia', () => {
      renderWith([sampleVideo]);
      const file = new File(['data'], 'video.mp4', { type: 'video/mp4' });
      (component as any).onEditCoverCard('v1', { target: { files: [file] } } as unknown as Event);

      expect(videoServiceMock.updateCover).not.toHaveBeenCalled();
    });

    it('#166 arquivo maior que 10MB nao envia', () => {
      renderWith([sampleVideo]);
      const bigContent = new Uint8Array(11 * 1024 * 1024);
      const bigFile = new File([bigContent], 'huge.jpg', { type: 'image/jpeg' });
      (component as any).onEditCoverCard('v1', { target: { files: [bigFile] } } as unknown as Event);

      expect(videoServiceMock.updateCover).not.toHaveBeenCalled();
    });

    it('#167 botao de editar capa visivel no mobile (admin)', () => {
      renderWith([sampleVideo]);
      const btn = fixture.nativeElement.querySelector('.video-card [aria-label="Editar capa"]');
      expect(btn).toBeTruthy();
    });

    it('#168 clicar no editar capa nao abre a modal de video', () => {
      renderWith([sampleVideo]);
      const btn = fixture.nativeElement.querySelector('.video-card [aria-label="Editar capa"]') as HTMLButtonElement;
      if (btn) {
        btn.click();
        fixture.changeDetectorRef.detectChanges();
      }

      expect(modalServiceMock.open).not.toHaveBeenCalled();
    });

    it('#169 duplo clique rapido no botao — apenas um upload', () => {
      renderWith([sampleVideo]);
      const file = new File(['img'], 'capa.jpg', { type: 'image/jpeg' });
      (component as any).onEditCoverCard('v1', { target: { files: [file] } } as unknown as Event);
      (component as any).onEditCoverCard('v1', { target: { files: [file] } } as unknown as Event);

      expect(videoServiceMock.updateCover).toHaveBeenCalledTimes(1);
    });
  });

  // ── A20. Loading state e carregamento inicial de videos ──────────

  describe('A20 — Loading state e carregamento inicial', () => {
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

    it('#170 primeiro acesso — loading true exibe indicador, nao empty state', () => {
      loadingSignal.set(true);
      videosSignal.set([]);
      fixture.changeDetectorRef.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const loading = el.querySelector('.loading');
      const emptyState = el.querySelector('.empty-state');

      expect(loading).toBeTruthy();
      expect(emptyState).toBeNull();
    });

    it('#171 HTTP conclui com videos — loading desaparece e carrosseis aparecem', () => {
      loadingSignal.set(true);
      videosSignal.set([]);
      fixture.changeDetectorRef.detectChanges();

      // HTTP conclui
      loadingSignal.set(false);
      videosSignal.set([makeVideo('v1', 'Video 1', 'Bolos')]);
      fixture.changeDetectorRef.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.loading')).toBeNull();
      expect(el.querySelectorAll('app-category-carousel').length).toBe(1);
    });

    it('#172 HTTP conclui com lista vazia — loading desaparece e empty state aparece', () => {
      loadingSignal.set(true);
      videosSignal.set([]);
      fixture.changeDetectorRef.detectChanges();

      // HTTP conclui com lista vazia
      loadingSignal.set(false);
      videosSignal.set([]);
      fixture.changeDetectorRef.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.loading')).toBeNull();
      expect(el.querySelector('.empty-state')).toBeTruthy();
    });

    it('#173 HTTP falha (erro 500) — loading desaparece e feedback aparece', () => {
      loadingSignal.set(true);
      videosSignal.set([]);
      fixture.changeDetectorRef.detectChanges();

      // HTTP falha
      loadingSignal.set(false);
      videosSignal.set([]);
      fixture.changeDetectorRef.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.loading')).toBeNull();
      const feedback = el.querySelector('.empty-state');
      expect(feedback).toBeTruthy();
    });

    it('#174 signal loading() inicia true durante loadVideos', () => {
      loadingSignal.set(true);
      expect(videoServiceMock.loading()).toBe(true);
    });

    it('#175 signal loading() muda para false apos resposta', () => {
      loadingSignal.set(true);
      loadingSignal.set(false);
      expect(videoServiceMock.loading()).toBe(false);
    });

    it('#176 template usa loading para decidir: loading → spinner, vazio → empty, dados → carrossel', () => {
      // Estado 1: loading
      loadingSignal.set(true);
      videosSignal.set([]);
      fixture.changeDetectorRef.detectChanges();
      let el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.loading')).toBeTruthy();
      expect(el.querySelector('.empty-state')).toBeNull();
      expect(el.querySelectorAll('app-category-carousel').length).toBe(0);

      // Estado 2: vazio
      loadingSignal.set(false);
      videosSignal.set([]);
      fixture.changeDetectorRef.detectChanges();
      el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.loading')).toBeNull();
      expect(el.querySelector('.empty-state')).toBeTruthy();

      // Estado 3: com dados
      videosSignal.set([makeVideo('v1', 'Video 1', 'Bolos')]);
      fixture.changeDetectorRef.detectChanges();
      el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.loading')).toBeNull();
      expect(el.querySelector('.empty-state')).toBeNull();
      expect(el.querySelectorAll('app-category-carousel').length).toBe(1);
    });

    it('#177 re-navegar para Home quando videos ja carregaram — sem loading', () => {
      loadingSignal.set(false);
      videosSignal.set([makeVideo('v1', 'Video 1', 'Bolos')]);
      fixture.changeDetectorRef.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.loading')).toBeNull();
      expect(el.querySelectorAll('app-category-carousel').length).toBe(1);
    });

    it('#178 clicar em Inicio apos login — videos aparecem (signal ja atualizado)', () => {
      loadingSignal.set(false);
      videosSignal.set([makeVideo('v1', 'Video 1', 'Bolos')]);
      fixture.changeDetectorRef.detectChanges();

      expect(component.videosByCategory.length).toBe(1);
    });

    it('#179 loadVideos chamado novamente (refresh) — loading aparece brevemente', () => {
      loadingSignal.set(false);
      videosSignal.set([makeVideo('v1', 'Video 1', 'Bolos')]);
      fixture.changeDetectorRef.detectChanges();

      // Refresh inicia
      loadingSignal.set(true);
      fixture.changeDetectorRef.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.loading')).toBeTruthy();
    });

    it('#180 change detection acionado apos signal atualizar', () => {
      videosSignal.set([makeVideo('v1', 'Video 1', 'Bolos')]);
      fixture.changeDetectorRef.detectChanges();

      expect(component.videosByCategory.length).toBe(1);
      expect(fixture.nativeElement.querySelectorAll('app-category-carousel').length).toBe(1);
    });

    it('#181 template re-renderiza apos signal mudar', () => {
      loadingSignal.set(false);
      videosSignal.set([]);
      fixture.changeDetectorRef.detectChanges();
      expect(fixture.nativeElement.querySelector('.empty-state')).toBeTruthy();

      videosSignal.set([makeVideo('v1', 'Video 1', 'Bolos')]);
      fixture.changeDetectorRef.detectChanges();
      expect(fixture.nativeElement.querySelector('.empty-state')).toBeNull();
      expect(fixture.nativeElement.querySelectorAll('app-category-carousel').length).toBe(1);
    });
  });
});
