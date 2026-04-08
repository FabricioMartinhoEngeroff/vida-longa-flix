import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { MenuAdminComponent } from './menu-admin.component';
import { MenuService } from '../../shared/services/menus/menus-service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { signal } from '@angular/core';

describe('MenuAdminComponent', () => {
  let component: MenuAdminComponent;
  let fixture: ComponentFixture<MenuAdminComponent>;
  let httpMock: HttpTestingController;
  let addMenuSpy: ReturnType<typeof vi.fn>;
  let removeMenuSpy: ReturnType<typeof vi.fn>;

  const mockCategories = [
    { id: 'uuid-1', name: 'Almoço', type: 'MENU' },
    { id: 'uuid-2', name: 'Jantar', type: 'MENU' },
  ];

  beforeEach(async () => {
    addMenuSpy = vi.fn();
    removeMenuSpy = vi.fn();

    const menusSignal = signal<any[]>([
      { id: 'm1', title: 'Menu 1', category: { id: 'uuid-1', name: 'Almoço', type: 'MENU' } },
    ]);

    await TestBed.configureTestingModule({
      imports: [MenuAdminComponent, HttpClientTestingModule],
      providers: [
        { provide: MenuService, useValue: { addMenu: addMenuSpy, removeMenu: removeMenuSpy, menus: menusSignal.asReadonly() } }
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(MenuAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(false);

    // Consome o GET de categorias que o ngOnInit dispara
    httpMock.expectOne(req =>
      req.url.includes('/categories') && req.params.get('type') === 'MENU'
    ).flush(mockCategories);

    fixture.detectChanges(false);
  });

  afterEach(() => httpMock.verify());

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories on init', () => {
    expect(component.categories.length).toBe(2);
    expect(component.categories[0].name).toBe('Almoço');
  });

  it('should not save if form is invalid', () => {
    component.form.patchValue({ title: '', description: '' });
    component.save();
    expect(addMenuSpy).not.toHaveBeenCalled();
  });

 it('should call addMenu when form is valid', async () => {
  component.form.patchValue({
    title: 'Cardápio do Dia',
    description: 'Refeição saudável e simples',
    categoryName: 'Almoço',
    cover: 'https://example.com/cover.jpg',
    recipe: 'Modo de preparo',
    nutritionistTips: 'Dica da nutri',
    protein: 20,
    carbs: 30,
    fat: 10,
    fiber: 5,
    calories: 350,
  });

  await component.save();

  // Verifica campos específicos sem objectContaining
  const called = addMenuSpy.mock.calls[0][0];
  expect(called.title).toBe('Cardápio do Dia');
  expect(called.categoryId).toBe('uuid-1');
  expect(called.protein).toBe(20);
  expect(called.calories).toBe(350);
});

  it('should find category from fresh API list when not in local list', async () => {
    component.form.patchValue({
      title: 'Cardapio novo',
      description: 'Descricao longa',
      categoryName: 'Lanche',
      cover: 'https://example.com/cover.jpg',
    });

    const p = component.save();

    // ensureCategoryId busca lista atualizada da API quando nao acha localmente
    const listReq = httpMock.expectOne((r) =>
      r.method === 'GET' &&
      r.url === `${environment.apiUrl}/categories` &&
      r.params.get('type') === 'MENU'
    );
    listReq.flush([...mockCategories, { id: 'cat-new', name: 'Lanche', type: 'MENU' }]);

    await p;

    const called = addMenuSpy.mock.calls[0][0];
    expect(called.categoryId).toBe('cat-new');
    expect(called.title).toBe('Cardapio novo');
  });

  it('should reset form after save', async () => {
    component.form.patchValue({
      title: 'Test Menu',
      description: 'Test Description',
      categoryName: 'Almoço',
    });

    await component.save();

    expect(component.form.get('title')?.value).toBeNull();
    expect(component.form.get('categoryName')?.value).toBe('');
  });

  it('should process cover file upload', () => {
    const createObjectURL = (URL as any).createObjectURL;
    (URL as any).createObjectURL = vi.fn(() => 'blob:mock');

    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file] } } as any;

    component.onCoverFile(event);

    expect(component.form.get('cover')?.value).toContain('blob:');

    (URL as any).createObjectURL = createObjectURL;
  });

  it('should not call addMenu when no file selected', () => {
    const event = { target: { files: [] } } as any;
    component.onCoverFile(event);
    expect(component.form.get('cover')?.value).toBe('');
  });

  // ─── A2. Renderização — tela menu-admin ────────────────

  it('#4 titulo Importação via CSV aparece no topo', () => {
    const title = fixture.nativeElement.querySelector('.csv-title');
    expect(title).toBeTruthy();
    expect(title.textContent).toContain('Importação via CSV');
  });

  it('#5 campo de upload CSV existe abaixo do titulo', () => {
    const area = fixture.nativeElement.querySelector('.csv-upload-area');
    expect(area).toBeTruthy();
    const text = area.textContent;
    expect(text).toContain('Arraste e solte o arquivo CSV aqui ou clique para selecionar');
  });

  it('#6 formulario individual de cadastro continua abaixo', () => {
    const csvSection = fixture.nativeElement.querySelector('app-csv-upload');
    const h2 = fixture.nativeElement.querySelector('h2');
    expect(csvSection).toBeTruthy();
    expect(h2.textContent).toContain('Adicionar Cardápio');
    const parent = csvSection.parentElement;
    const children = Array.from(parent!.children);
    expect(children.indexOf(csvSection)).toBeLessThan(children.indexOf(h2));
  });

  it('should ask confirmation and call removeMenu when confirmed', () => {
    fixture.detectChanges(false);

    const btn = fixture.nativeElement.querySelector('[aria-label="Deletar cardápio"]') as HTMLButtonElement;
    btn.click();
    fixture.detectChanges(false);

    const confirm = fixture.nativeElement.querySelector('.confirm-btn') as HTMLButtonElement;
    confirm.click();

    expect(removeMenuSpy).toHaveBeenCalledWith('m1');
  });

  // ═══════════════════════════════════════════════════════════
  // A21. Layout espacoso para descricao, receita e dicas (menu-admin)
  // ═══════════════════════════════════════════════════════════

  describe('A21 — Layout espacoso (menu-admin)', () => {
    it('#191 campo descricao usa textarea (nao input text), full-width', () => {
      const textarea = fixture.nativeElement.querySelector('textarea[formControlName="description"]');
      expect(textarea).toBeTruthy();
      expect(textarea.closest('.grid')).toBeNull();
    });

    it('#192 campo receita usa textarea (nao input text), full-width', () => {
      const textarea = fixture.nativeElement.querySelector('textarea[formControlName="recipe"]');
      expect(textarea).toBeTruthy();
      expect(textarea.closest('.grid')).toBeNull();
    });

    it('#193 campo dicas da nutri usa textarea (nao input text), full-width', () => {
      const textarea = fixture.nativeElement.querySelector('textarea[formControlName="nutritionistTips"]');
      expect(textarea).toBeTruthy();
      expect(textarea.closest('.grid')).toBeNull();
    });

    it('#194 textarea de descricao tem altura minima confortavel (min 6 rows)', () => {
      const textarea = fixture.nativeElement.querySelector('textarea[formControlName="description"]');
      expect(textarea).toBeTruthy();
      expect(Number(textarea.getAttribute('rows'))).toBeGreaterThanOrEqual(6);
    });

    it('#195 textarea de receita tem altura minima confortavel (min 6 rows)', () => {
      const textarea = fixture.nativeElement.querySelector('textarea[formControlName="recipe"]');
      expect(textarea).toBeTruthy();
      expect(Number(textarea.getAttribute('rows'))).toBeGreaterThanOrEqual(6);
    });

    it('#196 textarea de dicas da nutri tem altura minima confortavel (min 6 rows)', () => {
      const textarea = fixture.nativeElement.querySelector('textarea[formControlName="nutritionistTips"]');
      expect(textarea).toBeTruthy();
      expect(Number(textarea.getAttribute('rows'))).toBeGreaterThanOrEqual(6);
    });

    it('#197 Enter na descricao preserva quebra de linha', () => {
      component.form.patchValue({ description: 'Linha 1\nLinha 2' });
      expect(component.form.get('description')?.value).toContain('\n');
    });

    it('#198 Enter na receita preserva quebra de linha', () => {
      component.form.patchValue({ recipe: 'Etapa 1\nEtapa 2' });
      expect(component.form.get('recipe')?.value).toContain('\n');
    });

    it('#199 Enter nas dicas da nutri preserva quebra de linha', () => {
      component.form.patchValue({ nutritionistTips: 'Dica 1\nDica 2' });
      expect(component.form.get('nutritionistTips')?.value).toContain('\n');
    });

    it('#200 ordem: titulo+categoria (grid) → descricao → upload capa → receita → dicas → nutricionais', () => {
      const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
      const all = form.querySelectorAll('[formControlName], .upload-area');
      const order: string[] = [];
      all.forEach((el: Element) => {
        const name = el.getAttribute('formControlName');
        if (name) order.push(name);
        else if (el.classList.contains('upload-area')) order.push('upload');
      });

      const titleIdx = order.indexOf('title');
      const catIdx = order.indexOf('categoryName');
      const descIdx = order.indexOf('description');
      const uploadIdx = order.indexOf('upload');
      const recipeIdx = order.indexOf('recipe');
      const tipsIdx = order.indexOf('nutritionistTips');
      const proteinIdx = order.indexOf('protein');

      expect(descIdx).toBeGreaterThan(Math.max(titleIdx, catIdx));
      expect(uploadIdx).toBeGreaterThan(descIdx);
      expect(recipeIdx).toBeGreaterThan(uploadIdx);
      expect(tipsIdx).toBeGreaterThan(recipeIdx);
      expect(proteinIdx).toBeGreaterThan(tipsIdx);
    });

    it('#201 desktop — textareas de descricao, receita e dicas nao estao no grid', () => {
      const desc = fixture.nativeElement.querySelector('textarea[formControlName="description"]');
      const recipe = fixture.nativeElement.querySelector('textarea[formControlName="recipe"]');
      const tips = fixture.nativeElement.querySelector('textarea[formControlName="nutritionistTips"]');
      expect(desc).toBeTruthy();
      expect(recipe).toBeTruthy();
      expect(tips).toBeTruthy();
      expect(desc.closest('.grid')).toBeNull();
      expect(recipe.closest('.grid')).toBeNull();
      expect(tips.closest('.grid')).toBeNull();
    });

    it('#202 mobile — textareas existem fora do grid para usar largura total', () => {
      const desc = fixture.nativeElement.querySelector('textarea[formControlName="description"]');
      const recipe = fixture.nativeElement.querySelector('textarea[formControlName="recipe"]');
      const tips = fixture.nativeElement.querySelector('textarea[formControlName="nutritionistTips"]');
      expect(desc).toBeTruthy();
      expect(recipe).toBeTruthy();
      expect(tips).toBeTruthy();
      expect(desc.closest('.grid')).toBeNull();
      expect(recipe.closest('.grid')).toBeNull();
      expect(tips.closest('.grid')).toBeNull();
    });

    it('#203 colar texto com topicos na descricao preserva formatacao', () => {
      const pasted = '- Topico 1\n- Topico 2\n- Topico 3';
      component.form.patchValue({ description: pasted });
      expect(component.form.get('description')?.value).toBe(pasted);
    });

    it('#205 colar texto longo em dicas da nutri preserva formatacao', () => {
      const pasted = 'Dica importante:\n- Hidratar-se\n- Comer devagar';
      component.form.patchValue({ nutritionistTips: pasted });
      expect(component.form.get('nutritionistTips')?.value).toBe(pasted);
    });

    it('#206 textarea com muito conteudo nao perde dados', () => {
      const longText = Array.from({ length: 50 }, (_, i) => `Linha ${i + 1}`).join('\n');
      component.form.patchValue({ description: longText });
      expect(component.form.get('description')?.value).toBe(longText);
    });

    it('#207 campos nutricionais permanecem no grid de 2 colunas', () => {
      const proteinInput = fixture.nativeElement.querySelector('[formControlName="protein"]');
      expect(proteinInput).toBeTruthy();
      expect(proteinInput.closest('.grid')).toBeTruthy();
    });

    it('#208 titulo e categoria lado a lado no mesmo grid', () => {
      const titleInput = fixture.nativeElement.querySelector('[formControlName="title"]');
      const catInput = fixture.nativeElement.querySelector('[formControlName="categoryName"]');
      expect(titleInput.closest('.grid')).toBeTruthy();
      expect(catInput.closest('.grid')).toBeTruthy();
      expect(titleInput.closest('.grid')).toBe(catInput.closest('.grid'));
    });

    it('#209 descricao com \\n preserva quebras no payload do submit', async () => {
      component.form.patchValue({
        title: 'Cardapio A21',
        description: 'Linha 1\nLinha 2',
        categoryName: 'Almoço',
      });
      await component.save();
      const called = addMenuSpy.mock.calls[0][0];
      expect(called.description).toBe('Linha 1\nLinha 2');
    });

    it('#210 receita com \\n preserva quebras no payload do submit', async () => {
      component.form.patchValue({
        title: 'Cardapio A21',
        description: 'Descricao valida',
        categoryName: 'Almoço',
        recipe: 'Passo 1\nPasso 2',
      });
      await component.save();
      const called = addMenuSpy.mock.calls[0][0];
      expect(called.recipe).toBe('Passo 1\nPasso 2');
    });

    it('#211 dicas da nutri com \\n preserva quebras no payload do submit', async () => {
      component.form.patchValue({
        title: 'Cardapio A21',
        description: 'Descricao valida',
        categoryName: 'Almoço',
        nutritionistTips: 'Dica 1\nDica 2',
      });
      await component.save();
      const called = addMenuSpy.mock.calls[0][0];
      expect(called.nutritionistTips).toBe('Dica 1\nDica 2');
    });
  });
});
