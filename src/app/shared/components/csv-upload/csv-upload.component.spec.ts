import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { CsvUploadComponent } from './csv-upload.component';
import { NotificationService } from '../../services/alert-message/alert-message.service';
import { environment } from '../../../../environments/environment';

describe('CsvUploadComponent', () => {
  let component: CsvUploadComponent;
  let fixture: ComponentFixture<CsvUploadComponent>;
  let httpMock: HttpTestingController;
  let alertSpy: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    warning: ReturnType<typeof vi.fn>;
  };

  /** Detecta changes sem NG0100 check */
  function cd(): void {
    fixture.componentRef.changeDetectorRef.detectChanges();
  }

  beforeEach(async () => {
    alertSpy = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CsvUploadComponent, HttpClientTestingModule],
      providers: [
        { provide: NotificationService, useValue: alertSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CsvUploadComponent);
    component = fixture.componentInstance;
    component.endpoint = '/admin/import/videos';
    httpMock = TestBed.inject(HttpTestingController);
    cd();
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ─── Helper ──────────────────────────────────────────────
  function createFile(name: string, size: number, type = 'text/csv'): File {
    const content = new ArrayBuffer(size);
    return new File([content], name, { type });
  }

  function getUploadArea(): HTMLElement {
    return fixture.nativeElement.querySelector('.csv-upload-area');
  }

  function getFileInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input[type="file"]');
  }

  function selectFile(file: File): void {
    const mockEvent = { target: { files: [file] } } as unknown as Event;
    component.onFileSelect(mockEvent);
    cd();
  }

  function dropFile(file: File): void {
    const mockEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { files: [file] },
    } as unknown as DragEvent;
    component.onDrop(mockEvent);
    cd();
  }

  function triggerImport(): void {
    component.importCsv();
    cd();
  }

  function selectAndUpload(response: any, opts?: { status: number; statusText: string }): void {
    selectFile(createFile('dados.csv', 100));
    triggerImport();

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/import/videos`);
    if (opts) {
      req.flush(response, opts);
    } else {
      req.flush(response);
    }
    cd();
  }

  // ─── A3. Campo de upload — clicar para buscar ────────────

  describe('A3. Campo de upload — clicar para buscar', () => {
    it('#7 input file deve aceitar apenas .csv', () => {
      const input = getFileInput();
      expect(input).toBeTruthy();
      expect(input.accept).toBe('.csv');
    });

    it('#8 selecionar .csv mostra nome do arquivo e icone check_circle', () => {
      selectFile(createFile('dados.csv', 100));

      expect(component.fileName).toBe('dados.csv');
      const icon = fixture.nativeElement.querySelector('.csv-upload-icon mat-icon');
      expect(icon.textContent.trim()).toBe('check_circle');
    });

    it('#9 cancelar selecao nao altera o campo', () => {
      const mockEvent = { target: { files: [] } } as unknown as Event;
      component.onFileSelect(mockEvent);
      cd();

      expect(component.fileName).toBe('');
    });
  });

  // ─── A4. Campo de upload — arrastar e soltar ─────────────

  describe('A4. Arrastar e soltar', () => {
    it('#10 arrastar csv sobre o campo aplica classe drag-active', () => {
      component.onDragEnter();
      cd();

      const area = getUploadArea();
      expect(area.classList.contains('drag-active')).toBe(true);
    });

    it('#11 soltar csv no campo mostra nome e check_circle', () => {
      dropFile(createFile('menus.csv', 200));

      expect(component.fileName).toBe('menus.csv');
      const area = getUploadArea();
      expect(area.classList.contains('file-selected')).toBe(true);
    });

    it('#12 dragleave remove classe drag-active', () => {
      component.onDragEnter();
      cd();
      component.onDragLeave();
      cd();

      const area = getUploadArea();
      expect(area.classList.contains('drag-active')).toBe(false);
    });
  });

  // ─── A5. Validacao de arquivo ────────────────────────────

  describe('A5. Validacao de arquivo', () => {
    it('#13 arquivo nao-csv e rejeitado com alerta', () => {
      dropFile(createFile('doc.pdf', 100, 'application/pdf'));

      expect(alertSpy.error).toHaveBeenCalledWith('Apenas arquivos .csv são aceitos.');
      expect(component.fileName).toBe('');
    });

    it('#14 csv vazio (0 bytes) e rejeitado', () => {
      dropFile(createFile('vazio.csv', 0));

      expect(alertSpy.error).toHaveBeenCalledWith('O arquivo está vazio.');
      expect(component.fileName).toBe('');
    });

    it('#15 csv maior que 50MB e rejeitado', () => {
      dropFile(createFile('grande.csv', 51 * 1024 * 1024));

      expect(alertSpy.error).toHaveBeenCalledWith('Arquivo muito grande. Tamanho máximo: 50MB.');
      expect(component.fileName).toBe('');
    });

    it('#16 extensao .CSV maiuscula e aceita', () => {
      dropFile(createFile('DADOS.CSV', 100));

      expect(component.fileName).toBe('DADOS.CSV');
    });

    it('#17 novo arquivo substitui o anterior', () => {
      selectFile(createFile('primeiro.csv', 100));
      expect(component.fileName).toBe('primeiro.csv');

      selectFile(createFile('segundo.csv', 200));
      expect(component.fileName).toBe('segundo.csv');
    });

    it('#18 clicar X reseta o campo ao estado inicial', () => {
      selectFile(createFile('dados.csv', 100));
      expect(component.fileName).toBe('dados.csv');

      component.clearFile();
      cd();

      expect(component.fileName).toBe('');
      expect(component.file).toBeNull();
    });
  });

  // ─── A6. Envio e loading ─────────────────────────────────

  describe('A6. Envio e loading', () => {
    it('#19 importar ativa uploading durante envio', () => {
      selectFile(createFile('dados.csv', 100));
      triggerImport();

      expect(component.uploading).toBe(true);

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/import/videos`);
      req.flush({ imported: 1, errors: [] });
    });

    it('#20 durante envio, campo fica desabilitado', () => {
      selectFile(createFile('dados.csv', 100));
      triggerImport();

      expect(component.uploading).toBe(true);

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/import/videos`);
      req.flush({ imported: 1, errors: [] });
    });

    it('#21 apos envio, campo volta ao estado inicial', () => {
      selectAndUpload({ imported: 5, errors: [] });

      expect(component.uploading).toBe(false);
      expect(component.fileName).toBe('');
    });
  });

  // ─── A7. Sucesso total ───────────────────────────────────

  describe('A7. Sucesso total', () => {
    it('#22 csv com todas linhas validas mostra sucesso', () => {
      selectAndUpload({ imported: 10, errors: [] });

      expect(alertSpy.success).toHaveBeenCalledWith('10 registros importados com sucesso!');
    });
  });

  // ─── A8. Sucesso parcial ─────────────────────────────────

  describe('A8. Sucesso parcial', () => {
    const partialResponse = {
      imported: 10,
      skipped: 2,
      errors: [
        "Linha 3: categoryName 'Yoga' não encontrada.",
        "Linha 7: 'title' é obrigatório",
      ],
    };

    it('#23 sucesso parcial mostra warning com contadores', () => {
      selectAndUpload(partialResponse);

      expect(alertSpy.warning).toHaveBeenCalledWith('10 importados, 2 com erro.');
    });

    it('#24 cada erro mostra o numero da linha do csv', () => {
      selectAndUpload(partialResponse);

      expect(component.errors.length).toBe(2);
      expect(component.errors[0]).toContain('Linha 3');
      expect(component.errors[0]).toContain('Yoga');
      expect(component.errors[1]).toContain('Linha 7');
    });

    it('#25 muitos erros exibem lista com scroll', () => {
      const manyErrors = Array.from({ length: 20 }, (_, i) =>
        `Linha ${i + 1}: erro na linha ${i + 1}`
      );

      selectAndUpload({ imported: 5, skipped: 20, errors: manyErrors });

      expect(component.errors.length).toBe(20);
    });
  });

  // ─── A9. Erro total ──────────────────────────────────────

  describe('A9. Erro total', () => {
    it('#26 nenhuma linha valida mostra erro', () => {
      selectAndUpload({
        imported: 0,
        skipped: 2,
        errors: ["Linha 1: 'title' é obrigatório", "Linha 2: 'url' é obrigatório"],
      });

      expect(alertSpy.error).toHaveBeenCalledWith(
        'Nenhum registro importado. Verifique os erros abaixo.'
      );
    });
  });

  // ─── A10. Erros de rede / servidor ───────────────────────

  describe('A10. Erros de rede/servidor', () => {
    it('#27 erro 500 mostra alerta generico', () => {
      selectAndUpload('Server Error', { status: 500, statusText: 'Server Error' });

      expect(alertSpy.error).toHaveBeenCalledWith(
        'Erro ao importar arquivo. Tente novamente.'
      );
    });

    it('#28 erro 401 nao mostra alerta (interceptor redireciona)', () => {
      selectAndUpload('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(alertSpy.error).not.toHaveBeenCalled();
    });

    it('#29 erro 403 mostra sem permissao', () => {
      selectAndUpload('Forbidden', { status: 403, statusText: 'Forbidden' });

      expect(alertSpy.error).toHaveBeenCalledWith(
        'Sem permissão para realizar esta ação.'
      );
    });

    it('#30 erro 400 mostra arquivo invalido', () => {
      selectAndUpload('Bad Request', { status: 400, statusText: 'Bad Request' });

      expect(alertSpy.error).toHaveBeenCalledWith(
        'Arquivo CSV inválido. Verifique o formato e tente novamente.'
      );
    });

    it('#31 timeout mostra tempo esgotado', () => {
      selectFile(createFile('dados.csv', 100));
      triggerImport();

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/import/videos`);
      req.error(new ProgressEvent('timeout'), { status: 0, statusText: 'Timeout' });
      cd();

      expect(alertSpy.error).toHaveBeenCalledWith(
        'Tempo esgotado. Tente novamente ou reduza o tamanho do arquivo.'
      );
    });
  });

  // ─── A11. Endpoint correto ───────────────────────────────

  describe('A11. Endpoint correto por tela', () => {
    it('#32 video-admin envia para /admin/import/videos', () => {
      component.endpoint = '/admin/import/videos';

      selectFile(createFile('videos.csv', 100));
      triggerImport();

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/import/videos`);
      expect(req.request.method).toBe('POST');
      req.flush({ imported: 1, errors: [] });
    });

    it('#33 menu-admin envia para /admin/import/menus', () => {
      component.endpoint = '/admin/import/menus';

      selectFile(createFile('menus.csv', 100));
      triggerImport();

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/import/menus`);
      expect(req.request.method).toBe('POST');
      req.flush({ imported: 1, errors: [] });
    });
  });
});
