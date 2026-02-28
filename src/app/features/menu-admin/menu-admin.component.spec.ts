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

  it('should create a new category when typed name does not exist', async () => {
    component.form.patchValue({
      title: 'Cardapio novo',
      description: 'Descricao longa',
      categoryName: 'Lanche',
      cover: 'https://example.com/cover.jpg',
    });

    const p = component.save();

    const createReq = httpMock.expectOne((r) => r.method === 'POST' && r.url === `${environment.apiUrl}/categories`);
    expect(createReq.request.body).toEqual({ name: 'Lanche', type: 'MENU' });
    createReq.flush({ id: 'cat-new', name: 'Lanche', type: 'MENU' });

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

  it('should ask confirmation and call removeMenu when confirmed', () => {
    fixture.detectChanges(false);

    const btn = fixture.nativeElement.querySelector('[aria-label="Deletar cardápio"]') as HTMLButtonElement;
    btn.click();
    fixture.detectChanges(false);

    const confirm = fixture.nativeElement.querySelector('.confirm-btn') as HTMLButtonElement;
    confirm.click();

    expect(removeMenuSpy).toHaveBeenCalledWith('m1');
  });
});
