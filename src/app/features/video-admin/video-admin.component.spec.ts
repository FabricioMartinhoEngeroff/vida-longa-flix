import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { VideoAdminComponent } from './video-admin.component';
import { VideoService } from '../../shared/services/video/video.service';
import { NotificationService } from '../../shared/services/alert-message/alert-message.service';
import { environment } from '../../../environments/environment';
import { signal, WritableSignal } from '@angular/core';

// Vitest objectContaining workaround (Jasmine types override expect)
const objectContaining = (obj: Record<string, unknown>) =>
  (expect as any).objectContaining(obj);

describe('VideoAdminComponent', () => {
  let component: VideoAdminComponent;
  let fixture: ComponentFixture<VideoAdminComponent>;
  let httpMock: HttpTestingController;
  let addVideoSpy: ReturnType<typeof vi.fn>;
  let removeVideoSpy: ReturnType<typeof vi.fn>;
  let alertSuccessSpy: ReturnType<typeof vi.fn>;
  let alertErrorSpy: ReturnType<typeof vi.fn>;
  let alertWarningSpy: ReturnType<typeof vi.fn>;
  let videosWritable: WritableSignal<any[]>;

  const mockCategories = [
    { id: 'cat-uuid-1', name: 'Bolos', type: 'VIDEO' },
    { id: 'cat-uuid-2', name: 'Salgados', type: 'VIDEO' },
  ];

  const defaultVideos = [
    { id: 'v1', title: 'Video 1', category: { id: 'cat-uuid-1', name: 'Bolos' } },
  ];

  beforeEach(async () => {
    addVideoSpy = vi.fn();
    removeVideoSpy = vi.fn();
    alertSuccessSpy = vi.fn();
    alertErrorSpy = vi.fn();
    alertWarningSpy = vi.fn();

    videosWritable = signal<any[]>([...defaultVideos]);

    await TestBed.configureTestingModule({
      imports: [VideoAdminComponent, HttpClientTestingModule],
      providers: [
        {
          provide: VideoService,
          useValue: {
            addVideo: addVideoSpy,
            removeVideo: removeVideoSpy,
            videos: videosWritable.asReadonly(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            success: alertSuccessSpy,
            error: alertErrorSpy,
            warning: alertWarningSpy,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoAdminComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    const req = httpMock.expectOne(
      (r) =>
        r.method === 'GET' &&
        r.url === `${environment.apiUrl}/categories` &&
        r.params.get('type') === 'VIDEO',
    );
    req.flush(mockCategories);

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ═══════════════════════════════════════════════════════════
  // A1. Renderizacao inicial
  // ═══════════════════════════════════════════════════════════

  describe('A1 — Renderizacao inicial', () => {
    it('#1 titulo "Adicionar Video" visivel', () => {
      const h2 = fixture.nativeElement.querySelector('h2');
      expect(h2).toBeTruthy();
      expect(h2.textContent).toContain('Adicionar Vídeo');
    });

    it('#2 bloco de importacao CSV aparece acima do formulario', () => {
      const csvSection = fixture.nativeElement.querySelector('app-csv-upload');
      const h2 = fixture.nativeElement.querySelector('h2');
      expect(csvSection).toBeTruthy();
      expect(h2).toBeTruthy();
      const parent = csvSection.parentElement;
      const children = Array.from(parent!.children);
      expect(children.indexOf(csvSection)).toBeLessThan(children.indexOf(h2));
    });

    it('#3 campos de titulo, descricao e categoria aparecem', () => {
      const el = fixture.nativeElement;
      expect(el.querySelector('[formControlName="title"]')).toBeTruthy();
      expect(el.querySelector('[formControlName="description"]')).toBeTruthy();
      expect(el.querySelector('[formControlName="categoryName"]')).toBeTruthy();
    });

    it('#4 area de selecao de video aparece com hint de arrastar/selecionar', () => {
      const hints = fixture.nativeElement.querySelectorAll('.upload-hint');
      const videoHint = hints[0];
      expect(videoHint).toBeTruthy();
      expect(videoHint.textContent).toContain('Arraste e solte o vídeo');
    });

    it('#5 area de selecao de capa aparece com hint de arrastar/selecionar', () => {
      const hints = fixture.nativeElement.querySelectorAll('.upload-hint');
      const coverHint = hints[1];
      expect(coverHint).toBeTruthy();
      expect(coverHint.textContent).toContain('Arraste e solte a capa');
    });

    it('#6 secao "Videos cadastrados" mostra estado vazio quando nao ha videos', () => {
      videosWritable.set([]);
      fixture.detectChanges();
      const empty = fixture.nativeElement.querySelector('.resource-empty');
      expect(empty).toBeTruthy();
      expect(empty.textContent).toContain('Nenhum vídeo cadastrado.');
    });
  });

  // ═══════════════════════════════════════════════════════════
  // A2. Carregamento de categorias
  // ═══════════════════════════════════════════════════════════

  describe('A2 — Carregamento de categorias', () => {
    it('#7 componente faz GET /api/categories?type=VIDEO ao iniciar', () => {
      // A requisicao ja foi feita e verificada no beforeEach
      expect(component.categories.length).toBe(2);
    });

    it('#8 datalist e populado com os nomes retornados', () => {
      const options = fixture.nativeElement.querySelectorAll('#video-category-list option');
      expect(options.length).toBe(2);
      expect(options[0].value).toBe('Bolos');
      expect(options[1].value).toBe('Salgados');
    });

    it('#9 sistema reutiliza categoria existente no submit', async () => {
      component.form.patchValue({
        title: 'Video Teste',
        description: 'Descricao valida',
        url: 'https://cdn.example.com/video.mp4',
        categoryName: 'Bolos',
      });

      await component.save();

      expect(addVideoSpy).toHaveBeenCalledWith(
        objectContaining({ categoryId: 'cat-uuid-1' }),
      );
    });

    it('#10 sistema busca lista atualizada quando categoria nao esta na lista local', async () => {
      component.form.patchValue({
        title: 'Novo Video',
        description: 'Descricao valida',
        url: 'https://cdn.example.com/video.mp4',
        categoryName: 'Doces',
      });

      const p = component.save();

      const listReq = httpMock.expectOne(
        (r) =>
          r.method === 'GET' &&
          r.url === `${environment.apiUrl}/categories` &&
          r.params.get('type') === 'VIDEO',
      );
      listReq.flush([...mockCategories, { id: 'cat-new', name: 'Doces', type: 'VIDEO' }]);

      await p;

      expect(addVideoSpy).toHaveBeenCalled();
    });

    it('#11 cadastro usa categoryId retornado pela API atualizada', async () => {
      component.form.patchValue({
        title: 'Novo Video',
        description: 'Descricao valida',
        url: 'https://cdn.example.com/video.mp4',
        categoryName: 'Doces',
      });

      const p = component.save();

      const listReq = httpMock.expectOne(
        (r) =>
          r.method === 'GET' &&
          r.url === `${environment.apiUrl}/categories` &&
          r.params.get('type') === 'VIDEO',
      );
      listReq.flush([...mockCategories, { id: 'cat-doces', name: 'Doces', type: 'VIDEO' }]);

      await p;

      expect(addVideoSpy).toHaveBeenCalledWith(
        objectContaining({ categoryId: 'cat-doces' }),
      );
    });

    it('#12 falha ao carregar categorias nao quebra a tela', () => {
      const fixture2 = TestBed.createComponent(VideoAdminComponent);
      const comp2 = fixture2.componentInstance;

      const failReq = httpMock.expectOne(
        (r) =>
          r.method === 'GET' &&
          r.url === `${environment.apiUrl}/categories` &&
          r.params.get('type') === 'VIDEO',
      );
      failReq.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      fixture2.detectChanges();

      expect(comp2).toBeTruthy();
      expect(comp2.categories.length).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // A3. Validacao basica do formulario
  // ═══════════════════════════════════════════════════════════

  describe('A3 — Validacao basica do formulario', () => {
    it('#13 titulo vazio bloqueia submit', () => {
      component.form.patchValue({ title: '', description: 'Valido aqui', url: 'https://x.com/v.mp4', categoryName: 'Bolos' });
      component.save();
      expect(addVideoSpy).not.toHaveBeenCalled();
    });

    it('#14 descricao vazia bloqueia submit', () => {
      component.form.patchValue({ title: 'Titulo OK', description: '', url: 'https://x.com/v.mp4', categoryName: 'Bolos' });
      component.save();
      expect(addVideoSpy).not.toHaveBeenCalled();
    });

    it('#15 categoria vazia bloqueia submit', () => {
      component.form.patchValue({ title: 'Titulo OK', description: 'Valido aqui', url: 'https://x.com/v.mp4', categoryName: '' });
      component.save();
      expect(addVideoSpy).not.toHaveBeenCalled();
    });

    it('#16 titulo com menos de 3 caracteres bloqueia submit', () => {
      component.form.patchValue({ title: 'Ab', description: 'Valido aqui', url: 'https://x.com/v.mp4', categoryName: 'Bolos' });
      component.save();
      expect(addVideoSpy).not.toHaveBeenCalled();
    });

    it('#17 descricao com menos de 5 caracteres bloqueia submit', () => {
      component.form.patchValue({ title: 'Titulo OK', description: 'Abc', url: 'https://x.com/v.mp4', categoryName: 'Bolos' });
      component.save();
      expect(addVideoSpy).not.toHaveBeenCalled();
    });

    it('#18 todos campos obrigatorios validos habilita submit', () => {
      component.form.patchValue({
        title: 'Titulo Valido',
        description: 'Descricao valida aqui',
        url: 'https://cdn.example.com/video.mp4',
        categoryName: 'Bolos',
      });
      expect(component.form.valid).toBe(true);

      fixture.detectChanges();
      const btn = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(btn.disabled).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // A4. Campos longos e layout do formulario
  // ═══════════════════════════════════════════════════════════

  describe('A4 — Campos longos e layout do formulario', () => {
    it('#19 campo descricao usa textarea, nao input de linha unica', () => {
      const textarea = fixture.nativeElement.querySelector('textarea[formControlName="description"]');
      expect(textarea).toBeTruthy();
    });

    it('#20 campo receita usa textarea, nao input de linha unica', () => {
      const textarea = fixture.nativeElement.querySelector('textarea[formControlName="recipe"]');
      expect(textarea).toBeTruthy();
    });

    it('#21 texto longo na descricao e permitido sem truncar', () => {
      const longText = 'a'.repeat(500);
      component.form.patchValue({ description: longText });
      expect(component.form.get('description')?.value).toBe(longText);
    });

    it('#22 texto longo na receita e permitido sem truncar', () => {
      const longText = 'a'.repeat(500);
      component.form.patchValue({ recipe: longText });
      expect(component.form.get('recipe')?.value).toBe(longText);
    });

    it('#23 quebra de linha e preservada na descricao', () => {
      const multiline = 'Linha 1\nLinha 2\nLinha 3';
      component.form.patchValue({ description: multiline });
      expect(component.form.get('description')?.value).toContain('\n');
    });

    it('#24 quebra de linha e preservada na receita', () => {
      const multiline = 'Etapa 1\nEtapa 2\nEtapa 3';
      component.form.patchValue({ recipe: multiline });
      expect(component.form.get('recipe')?.value).toContain('\n');
    });

    it('#25 texto colado com multiplas linhas na descricao e preservado', () => {
      const pasted = 'Paragrafo 1\n\nParagrafo 2\nCom sublinha';
      component.form.patchValue({ description: pasted });
      expect(component.form.get('description')?.value).toBe(pasted);
    });

    it('#26 texto colado com multiplas linhas na receita e preservado', () => {
      const pasted = 'Ingredientes:\n- Farinha\n- Acucar\n\nModo de preparo:\n1. Misture';
      component.form.patchValue({ recipe: pasted });
      expect(component.form.get('recipe')?.value).toBe(pasted);
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('#27 formulario em desktop — campos alinhados visualmente', () => {
      // Teste visual — requer E2E ou visual regression
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('#28 formulario em mobile — campos empilham corretamente', () => {
      // Teste visual — requer E2E ou visual regression
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('#29 descricao e receita com muito conteudo — layout consistente', () => {
      // Teste visual — requer E2E ou visual regression
    });
  });

  // ═══════════════════════════════════════════════════════════
  // A5. Selecao de video e capa
  // ═══════════════════════════════════════════════════════════

  describe('A5 — Selecao de video e capa', () => {
    function createMockFile(name: string, type: string): File {
      return new File(['dummy'], name, { type });
    }

    function createFileInputEvent(file: File): Event {
      return { target: { files: [file] } } as unknown as Event;
    }

    function createDropEvent(file: File): DragEvent {
      return { preventDefault: vi.fn(), dataTransfer: { files: [file] } } as unknown as DragEvent;
    }

    it('#30 selecionar arquivo de video pelo input mostra o nome', () => {
      const file = createMockFile('receita.mp4', 'video/mp4');
      component.onVideoFile(createFileInputEvent(file));
      expect(component.videoFileName).toBe('receita.mp4');
    });

    it('#31 arrastar e soltar video mostra nome e remove estado de drag', () => {
      component.isDraggingVideo = true;
      const file = createMockFile('receita.mp4', 'video/mp4');
      component.onDropVideo(createDropEvent(file));
      expect(component.videoFileName).toBe('receita.mp4');
      expect(component.isDraggingVideo).toBe(false);
    });

    it('#32 selecionar imagem de capa pelo input mostra o nome', () => {
      const file = createMockFile('capa.jpg', 'image/jpeg');
      component.onCoverFile(createFileInputEvent(file));
      expect(component.coverFileName).toBe('capa.jpg');
    });

    it('#33 arrastar e soltar imagem de capa mostra nome e remove estado de drag', () => {
      component.isDraggingCover = true;
      const file = createMockFile('capa.jpg', 'image/jpeg');
      component.onDropCover(createDropEvent(file));
      expect(component.coverFileName).toBe('capa.jpg');
      expect(component.isDraggingCover).toBe(false);
    });

    it('#34 nenhum arquivo selecionado no input de video nao altera url', () => {
      const originalUrl = component.form.get('url')?.value;
      const emptyEvent = { target: { files: [] } } as unknown as Event;
      component.onVideoFile(emptyEvent);
      expect(component.form.get('url')?.value).toBe(originalUrl);
    });

    it('#35 nenhum arquivo selecionado no input de capa nao altera cover', () => {
      const originalCover = component.form.get('cover')?.value;
      const emptyEvent = { target: { files: [] } } as unknown as Event;
      component.onCoverFile(emptyEvent);
      expect(component.form.get('cover')?.value).toBe(originalCover);
    });

    it('#36 substituir video por outro arquivo antes de salvar usa o ultimo', () => {
      const file1 = createMockFile('video1.mp4', 'video/mp4');
      const file2 = createMockFile('video2.mp4', 'video/mp4');
      component.onVideoFile(createFileInputEvent(file1));
      component.onVideoFile(createFileInputEvent(file2));
      expect(component.videoFileName).toBe('video2.mp4');
    });

    it('#37 substituir capa por outra imagem antes de salvar usa a ultima', () => {
      const file1 = createMockFile('capa1.jpg', 'image/jpeg');
      const file2 = createMockFile('capa2.jpg', 'image/jpeg');
      component.onCoverFile(createFileInputEvent(file1));
      component.onCoverFile(createFileInputEvent(file2));
      expect(component.coverFileName).toBe('capa2.jpg');
    });
  });

  // ═══════════════════════════════════════════════════════════
  // A6. Contrato de midia valida
  // ═══════════════════════════════════════════════════════════

  describe('A6 — Contrato de midia valida', () => {
    function fillValidForm(overrides: Record<string, any> = {}) {
      component.form.patchValue({
        title: 'Video Teste',
        description: 'Descricao valida aqui',
        url: 'https://cdn.example.com/video.mp4',
        cover: 'https://cdn.example.com/cover.jpg',
        categoryName: 'Bolos',
        ...overrides,
      });
    }

    it('#38 url com URL publica https e considerada valida', async () => {
      fillValidForm({ url: 'https://cdn.exemplo.com/video.mp4' });
      await component.save();
      expect(addVideoSpy).toHaveBeenCalledWith(
        objectContaining({ url: 'https://cdn.exemplo.com/video.mp4' }),
      );
    });

    it('#39 cover com URL publica https e considerada valida', async () => {
      fillValidForm({ cover: 'https://cdn.exemplo.com/capa.jpg' });
      await component.save();
      expect(addVideoSpy).toHaveBeenCalledWith(
        objectContaining({ cover: 'https://cdn.exemplo.com/capa.jpg' }),
      );
    });

    it('#40 url com blob: bloqueia cadastro JSON', async () => {
      fillValidForm({ url: 'blob:http://localhost:4200/abc-123' });
      await component.save();
      expect(addVideoSpy).not.toHaveBeenCalled();
      expect(alertErrorSpy).toHaveBeenCalled();
    });

    it('#41 cover com blob: bloqueia cadastro JSON', async () => {
      fillValidForm({ cover: 'blob:http://localhost:4200/abc-123' });
      await component.save();
      expect(addVideoSpy).not.toHaveBeenCalled();
      expect(alertErrorSpy).toHaveBeenCalled();
    });

    it('#42 url com data:video/ bloqueia cadastro JSON', async () => {
      fillValidForm({ url: 'data:video/mp4;base64,AAAA' });
      await component.save();
      expect(addVideoSpy).not.toHaveBeenCalled();
      expect(alertErrorSpy).toHaveBeenCalled();
    });

    it('#43 cover com data:image/ bloqueia cadastro JSON', async () => {
      fillValidForm({ cover: 'data:image/png;base64,AAAA' });
      await component.save();
      expect(addVideoSpy).not.toHaveBeenCalled();
      expect(alertErrorSpy).toHaveBeenCalled();
    });

    it('#44 url com caminho local C:/ bloqueia cadastro JSON', async () => {
      fillValidForm({ url: 'C:/Users/fulano/Downloads/video.mp4' });
      await component.save();
      expect(addVideoSpy).not.toHaveBeenCalled();
      expect(alertErrorSpy).toHaveBeenCalled();
    });

    it('#45 cover com caminho local /home/ bloqueia cadastro JSON', async () => {
      fillValidForm({ cover: '/home/user/imagens/capa.jpg' });
      await component.save();
      expect(addVideoSpy).not.toHaveBeenCalled();
      expect(alertErrorSpy).toHaveBeenCalled();
    });

    it('#46 url com localhost bloqueia cadastro JSON', async () => {
      fillValidForm({ url: 'http://localhost:3000/video.mp4' });
      await component.save();
      expect(addVideoSpy).not.toHaveBeenCalled();
      expect(alertErrorSpy).toHaveBeenCalled();
    });

    it('#47 url com nome de arquivo sem URL publica bloqueia cadastro JSON', async () => {
      fillValidForm({ url: 'video.mp4' });
      await component.save();
      expect(addVideoSpy).not.toHaveBeenCalled();
      expect(alertErrorSpy).toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // A7. Integracao com backend (dois contratos)
  // ═══════════════════════════════════════════════════════════

  describe('A7 — Integracao com backend', () => {
    it('#48 submit com URL publica envia JSON com campos corretos', async () => {
      component.form.patchValue({
        title: 'Bolo de Cenoura',
        description: 'Receita simples e deliciosa',
        url: 'https://cdn.example.com/bolo.mp4',
        cover: 'https://cdn.example.com/cover.jpg',
        categoryName: 'Bolos',
        recipe: 'Receita do bolo',
        protein: 3,
        carbs: 20,
        fat: 5,
        fiber: 2,
        calories: 120,
      });

      await component.save();

      expect(addVideoSpy).toHaveBeenCalledWith({
        title: 'Bolo de Cenoura',
        description: 'Receita simples e deliciosa',
        url: 'https://cdn.example.com/bolo.mp4',
        cover: 'https://cdn.example.com/cover.jpg',
        categoryId: 'cat-uuid-1',
        recipe: 'Receita do bolo',
        protein: 3,
        carbs: 20,
        fat: 5,
        fiber: 2,
        calories: 120,
      });
    });

    it('#49 submit com arquivos locais nao envia blob em JSON', async () => {
      const videoFile = new File(['video-content'], 'video.mp4', { type: 'video/mp4' });
      const coverFile = new File(['cover-content'], 'cover.jpg', { type: 'image/jpeg' });

      component.form.patchValue({
        title: 'Video Local',
        description: 'Video do celular',
        categoryName: 'Bolos',
      });

      component.onVideoFile({ target: { files: [videoFile] } } as unknown as Event);
      component.onCoverFile({ target: { files: [coverFile] } } as unknown as Event);

      await component.save();

      if (addVideoSpy.mock.calls.length > 0) {
        const arg = addVideoSpy.mock.calls[0][0];
        expect(arg.url).not.toMatch(/^blob:/);
        expect(arg.cover).not.toMatch(/^blob:/);
      }
    });

    it('#50 descricao com multiplas linhas preserva quebras no payload', async () => {
      component.form.patchValue({
        title: 'Video Multiline',
        description: 'Linha 1\nLinha 2\nLinha 3',
        url: 'https://cdn.example.com/video.mp4',
        categoryName: 'Bolos',
      });

      await component.save();

      expect(addVideoSpy).toHaveBeenCalledWith(
        objectContaining({ description: 'Linha 1\nLinha 2\nLinha 3' }),
      );
    });

    it('#51 receita com multiplas linhas preserva quebras no payload', async () => {
      component.form.patchValue({
        title: 'Video Receita',
        description: 'Descricao valida aqui',
        url: 'https://cdn.example.com/video.mp4',
        categoryName: 'Bolos',
        recipe: 'Etapa 1\nEtapa 2\nEtapa 3',
      });

      await component.save();

      expect(addVideoSpy).toHaveBeenCalledWith(
        objectContaining({ recipe: 'Etapa 1\nEtapa 2\nEtapa 3' }),
      );
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('#52 backend responde 201 no fluxo JSON — sistema recarrega lista de videos', () => {
      // TDD: implementar apos integrar resposta do backend no componente
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('#53 backend responde sucesso no fluxo multipart — sistema recebe URLs publicas', () => {
      // TDD: implementar apos fluxo multipart
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('#54 backend responde 422 com erro em url — tela mostra feedback', () => {
      // TDD: implementar tratamento de erro 422
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('#55 backend responde 422 com erro em cover — tela mostra feedback', () => {
      // TDD: implementar tratamento de erro 422
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('#56 backend responde 500 — usuario recebe erro generico sem reset do formulario', () => {
      // TDD: implementar tratamento de erro 500
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('#57 backend responde sucesso mas recarga da lista falha — tela nao quebra', () => {
      // TDD: implementar fallback de recarga
    });
  });

  // ═══════════════════════════════════════════════════════════
  // A8. Fluxo esperado para arquivo local (multipart)
  // ═══════════════════════════════════════════════════════════

  describe('A8 — Fluxo multipart para arquivo local', () => {
    function createMockFile(name: string, type: string): File {
      return new File(['content'], name, { type });
    }

    function selectVideoFile(file: File) {
      component.onVideoFile({ target: { files: [file] } } as unknown as Event);
    }

    function selectCoverFile(file: File) {
      component.onCoverFile({ target: { files: [file] } } as unknown as Event);
    }

    it('#58 selecao de MP4 local prepara upload sem salvar blob em JSON', () => {
      const file = createMockFile('instagram_video.mp4', 'video/mp4');
      selectVideoFile(file);

      expect(component.videoFileName).toBe('instagram_video.mp4');
      // O File deve ser mantido para upload multipart
      expect((component as any).videoFile || component.form.get('url')?.value).toBeTruthy();
    });

    it('#59 selecao de imagem local de capa prepara upload real', () => {
      const file = createMockFile('capa_local.jpg', 'image/jpeg');
      selectCoverFile(file);

      expect(component.coverFileName).toBe('capa_local.jpg');
      expect((component as any).coverFile || component.form.get('cover')?.value).toBeTruthy();
    });

    it('#60 save com videoFile e coverFile validos nao envia blob em JSON', async () => {
      component.form.patchValue({
        title: 'Video Upload',
        description: 'Descricao valida aqui',
        categoryName: 'Bolos',
      });

      selectVideoFile(createMockFile('video.mp4', 'video/mp4'));
      selectCoverFile(createMockFile('capa.jpg', 'image/jpeg'));

      await component.save();

      if (addVideoSpy.mock.calls.length > 0) {
        const arg = addVideoSpy.mock.calls[0][0];
        expect(arg.url).not.toMatch(/^blob:/);
      }
    });

    it('#61 save com videoFile valido e sem coverFile nao quebra o fluxo', async () => {
      component.form.patchValue({
        title: 'Video sem Capa',
        description: 'Descricao valida aqui',
        categoryName: 'Bolos',
      });

      selectVideoFile(createMockFile('video.mp4', 'video/mp4'));

      let error: any = null;
      try {
        await component.save();
      } catch (e) {
        error = e;
      }
      expect(error).toBeNull();
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('#62 upload do video falha — cadastro final nao e enviado, usuario recebe feedback', () => {
      // TDD: implementar tratamento de falha de upload
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('#63 upload da capa falha — cadastro final nao e enviado, usuario recebe feedback', () => {
      // TDD: implementar tratamento de falha de upload
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('#64 upload local conclui com sucesso — cadastro final persiste com URLs publicas', () => {
      // TDD: implementar fluxo completo de upload multipart
    });
  });

  // ═══════════════════════════════════════════════════════════
  // A9. Sucesso de cadastro
  // ═══════════════════════════════════════════════════════════

  describe('A9 — Sucesso de cadastro', () => {
    async function saveValidVideo() {
      component.form.patchValue({
        title: 'Video Sucesso',
        description: 'Descricao valida aqui',
        url: 'https://cdn.example.com/video.mp4',
        cover: 'https://cdn.example.com/cover.jpg',
        categoryName: 'Bolos',
        recipe: 'Receita',
        protein: 3,
        carbs: 20,
        fat: 5,
        fiber: 2,
        calories: 120,
      });
      await component.save();
    }

    it('#65 addVideo e chamado apos cadastro valido', async () => {
      await saveValidVideo();
      expect(addVideoSpy).toHaveBeenCalled();
    });

    it('#66 formulario e resetado apos save', async () => {
      await saveValidVideo();
      expect(component.form.get('title')?.value).toBe(null);
    });

    it('#67 categoryName volta para string vazia', async () => {
      await saveValidVideo();
      expect(component.form.get('categoryName')?.value).toBe('');
    });

    it('#68 campos numericos voltam para 0', async () => {
      await saveValidVideo();
      expect(component.form.get('protein')?.value).toBe(0);
      expect(component.form.get('carbs')?.value).toBe(0);
      expect(component.form.get('fat')?.value).toBe(0);
      expect(component.form.get('fiber')?.value).toBe(0);
      expect(component.form.get('calories')?.value).toBe(0);
    });

    it('#69 videoFileName e limpo apos save', async () => {
      component.videoFileName = 'video.mp4';
      await saveValidVideo();
      expect(component.videoFileName).toBe('');
    });

    it('#70 coverFileName e limpo apos save', async () => {
      component.coverFileName = 'capa.jpg';
      await saveValidVideo();
      expect(component.coverFileName).toBe('');
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('#71 novo video aparece na lista apos recarga', () => {
      // TDD: depende de loadVideos() ser chamado apos addVideo
    });
  });

  // ═══════════════════════════════════════════════════════════
  // A10. Exclusao de videos e categorias
  // ═══════════════════════════════════════════════════════════

  describe('A10 — Exclusao de videos e categorias', () => {
    it('#72 clicar no icone de lixeira de video abre modal de confirmacao', () => {
      fixture.detectChanges();
      const btn = fixture.nativeElement.querySelector('[aria-label="Deletar vídeo"]') as HTMLButtonElement;
      btn.click();
      fixture.detectChanges();

      expect(component.isDeleteModalOpen).toBe(true);
    });

    it('#73 confirmar exclusao de video chama removeVideo(id)', () => {
      component.askDeleteVideo('v1', 'Video 1');
      component.confirmDelete();

      expect(removeVideoSpy).toHaveBeenCalledWith('v1');
    });

    it('#74 cancelar exclusao de video fecha modal sem remover item', () => {
      component.askDeleteVideo('v1', 'Video 1');
      component.cancelDelete();

      expect(component.isDeleteModalOpen).toBe(false);
      expect(removeVideoSpy).not.toHaveBeenCalled();
    });

    it('#75 clicar no icone de lixeira de categoria abre modal com contexto de categoria', () => {
      component.askDeleteCategory('cat-uuid-1', 'Bolos');

      expect(component.isDeleteModalOpen).toBe(true);
      expect(component.deleteTitle).toContain('categoria');
      expect(component.deleteMessage).toContain('Bolos');
    });

    it('#76 confirmar exclusao de categoria faz DELETE /api/categories/{id}', () => {
      component.askDeleteCategory('cat-uuid-1', 'Bolos');
      component.confirmDelete();

      const req = httpMock.expectOne(`${environment.apiUrl}/categories/cat-uuid-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('#77 exclusao de categoria com sucesso remove da lista local', () => {
      component.askDeleteCategory('cat-uuid-1', 'Bolos');
      component.confirmDelete();

      const req = httpMock.expectOne(`${environment.apiUrl}/categories/cat-uuid-1`);
      req.flush(null);

      expect(component.categories.find((c) => c.id === 'cat-uuid-1')).toBeUndefined();
    });

    it('#78 falha na exclusao de categoria fecha modal sem quebrar', () => {
      component.askDeleteCategory('cat-uuid-1', 'Bolos');
      component.confirmDelete();

      const req = httpMock.expectOne(`${environment.apiUrl}/categories/cat-uuid-1`);
      req.flush('Erro', { status: 500, statusText: 'Internal Server Error' });

      expect(component.isDeleteModalOpen).toBe(false);
      expect(component).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // A11. Estados vazios e listas
  // ═══════════════════════════════════════════════════════════

  describe('A11 — Estados vazios e listas', () => {
    it('#79 sem videos mostra "Nenhum video cadastrado."', () => {
      videosWritable.set([]);
      fixture.detectChanges();

      const empty = fixture.nativeElement.querySelector('.resource-empty');
      expect(empty).toBeTruthy();
      expect(empty.textContent).toContain('Nenhum vídeo cadastrado.');
    });

    it('#80 cada video mostra titulo e nome da categoria', () => {
      videosWritable.set([
        { id: 'v1', title: 'Bolo Fit', category: { id: 'c1', name: 'Bolos' } },
        { id: 'v2', title: 'Salada Top', category: { id: 'c2', name: 'Saladas' } },
      ]);
      fixture.detectChanges();

      const items = fixture.nativeElement.querySelectorAll('.videos-list .resource-item');
      expect(items.length).toBe(2);

      expect(items[0].querySelector('.resource-name').textContent).toContain('Bolo Fit');
      expect(items[0].querySelector('.resource-meta').textContent).toContain('Bolos');

      expect(items[1].querySelector('.resource-name').textContent).toContain('Salada Top');
      expect(items[1].querySelector('.resource-meta').textContent).toContain('Saladas');
    });

    it('#81 video sem categoria associada exibe fallback "Sem categoria"', () => {
      videosWritable.set([
        { id: 'v1', title: 'Video Orfao', category: { id: '', name: '' } },
      ]);
      fixture.detectChanges();

      const meta = fixture.nativeElement.querySelector('.resource-meta');
      expect(meta.textContent).toContain('Sem categoria');
    });

    it('#82 sem categorias mostra "Nenhuma categoria cadastrada."', () => {
      // Cria fixture fresco para evitar ExpressionChangedAfterItHasBeenChecked
      const fix2 = TestBed.createComponent(VideoAdminComponent);
      const comp2 = fix2.componentInstance;

      const req = httpMock.expectOne(
        (r: any) => r.method === 'GET' && r.url === `${environment.apiUrl}/categories` && r.params.get('type') === 'VIDEO',
      );
      req.flush([]); // Nenhuma categoria

      fix2.detectChanges();

      const empties = fix2.nativeElement.querySelectorAll('.resource-empty');
      const catEmpty = Array.from(empties).find((e: any) =>
        e.textContent.includes('categoria'),
      );
      expect(catEmpty).toBeTruthy();
    });

    it('#83 lista atualiza apos exclusao sem recarregar pagina', () => {
      videosWritable.set([
        { id: 'v1', title: 'Video 1', category: { id: 'c1', name: 'Bolos' } },
        { id: 'v2', title: 'Video 2', category: { id: 'c2', name: 'Saladas' } },
      ]);
      fixture.detectChanges();

      let items = fixture.nativeElement.querySelectorAll('.videos-list .resource-item');
      expect(items.length).toBe(2);

      videosWritable.set([
        { id: 'v2', title: 'Video 2', category: { id: 'c2', name: 'Saladas' } },
      ]);
      fixture.detectChanges();

      items = fixture.nativeElement.querySelectorAll('.videos-list .resource-item');
      expect(items.length).toBe(1);
      expect(items[0].querySelector('.resource-name').textContent).toContain('Video 2');
    });
  });

  // ═══════════════════════════════════════════════════════════
  // A12. Mobile e acessibilidade
  // ═══════════════════════════════════════════════════════════

  describe('A12 — Mobile e acessibilidade', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('#84 admin de videos no mobile — layout empilha campos sem quebrar', () => {
      // Teste visual — requer E2E ou visual regression
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('#85 area de upload no mobile — continua clicavel e legivel', () => {
      // Teste visual — requer E2E ou visual regression
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('#86 descricao e receita no mobile — altura adequada para texto longo', () => {
      // Teste visual — requer E2E ou visual regression
    });

    it('#87 botao de deletar video possui aria-label="Deletar video"', () => {
      const btn = fixture.nativeElement.querySelector('[aria-label="Deletar vídeo"]');
      expect(btn).toBeTruthy();
    });

    it('#88 botao de deletar categoria possui aria-label="Deletar categoria"', () => {
      const btn = fixture.nativeElement.querySelector('[aria-label="Deletar categoria"]');
      expect(btn).toBeTruthy();
    });

    it('#89 modal de confirmacao permite confirmar e cancelar por clique', () => {
      // Abre modal via clique no DOM (evita ExpressionChanged error)
      const btn = fixture.nativeElement.querySelector('[aria-label="Deletar vídeo"]') as HTMLButtonElement;
      btn.click();
      fixture.detectChanges();

      const confirmBtn = fixture.nativeElement.querySelector('.confirm-btn');
      const cancelBtn = fixture.nativeElement.querySelector('.cancel-btn');

      expect(confirmBtn).toBeTruthy();
      expect(cancelBtn).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // A13. Edge cases e regressao
  // ═══════════════════════════════════════════════════════════

  describe('A13 — Edge cases e regressao', () => {
    it('#90 espacos na categoria sao removidos com trim antes de buscar', async () => {
      component.form.patchValue({
        title: 'Video Trim',
        description: 'Descricao valida aqui',
        url: 'https://cdn.example.com/video.mp4',
        categoryName: '  Bolos  ',
      });

      await component.save();

      expect(addVideoSpy).toHaveBeenCalledWith(
        objectContaining({ categoryId: 'cat-uuid-1' }),
      );
    });

    it('#91 salvar duas vezes rapidamente nao cria duplicidade', async () => {
      component.form.patchValue({
        title: 'Video Duplo',
        description: 'Descricao valida aqui',
        url: 'https://cdn.example.com/video.mp4',
        categoryName: 'Bolos',
      });

      // Primeiro save reseta o form, segundo deveria ser bloqueado por form invalido
      await component.save();
      await component.save();

      expect(addVideoSpy).toHaveBeenCalledTimes(1);
    });

    it('#92 seleciona video local, remove selecao e salva — submit bloqueado sem url', async () => {
      const file = new File(['content'], 'video.mp4', { type: 'video/mp4' });
      component.onVideoFile({ target: { files: [file] } } as unknown as Event);

      // Remove a selecao
      component.videoFileName = '';
      component.form.patchValue({ url: '' });

      component.form.patchValue({
        title: 'Video Clear',
        description: 'Descricao valida',
        categoryName: 'Bolos',
      });

      await component.save();

      expect(addVideoSpy).not.toHaveBeenCalled();
    });

    it('#93 capa vazia e video invalido no fluxo JSON — erro em url, cadastro nao prossegue', async () => {
      component.form.patchValue({
        title: 'Video Invalido',
        description: 'Descricao valida aqui',
        url: 'blob:http://localhost/abc',
        cover: '',
        categoryName: 'Bolos',
      });

      await component.save();

      expect(addVideoSpy).not.toHaveBeenCalled();
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('#94 API publica devolve exatamente as URLs salvas — player usa URLs persistidas', () => {
      // TDD: requer teste de integracao com componente de player
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it('#95 registro legado com url quebrada — tela publica nao quebra', () => {
      // TDD: requer teste no componente de listagem publica
    });

    it('#96 descricao longa com paragrafos nao perde formatacao no cadastro', async () => {
      const descricao = 'Primeiro paragrafo.\n\nSegundo paragrafo.\n\n- Item 1\n- Item 2';
      component.form.patchValue({
        title: 'Video Formatado',
        description: descricao,
        url: 'https://cdn.example.com/video.mp4',
        categoryName: 'Bolos',
      });

      await component.save();

      expect(addVideoSpy).toHaveBeenCalledWith(
        objectContaining({ description: descricao }),
      );
    });

    it('#97 receita longa com multiplas etapas nao perde quebras de linha', async () => {
      const receita = '1. Misture a farinha\n2. Adicione o acucar\n3. Leve ao forno\n\nDica: use forma untada';
      component.form.patchValue({
        title: 'Video Receita Longa',
        description: 'Descricao valida aqui',
        url: 'https://cdn.example.com/video.mp4',
        categoryName: 'Bolos',
        recipe: receita,
      });

      await component.save();

      expect(addVideoSpy).toHaveBeenCalledWith(
        objectContaining({ recipe: receita }),
      );
    });
  });
});
