import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { MenuAdminComponent } from './menu-admin.component';
import { MenuService } from '../../shared/services/menus/menus-service';


describe('MenuAdminComponent', () => {
  let component: MenuAdminComponent;
  let fixture: ComponentFixture<MenuAdminComponent>;
  let addSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    addSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [MenuAdminComponent],
      providers: [{ provide: MenuService, useValue: { add: addSpy } }],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should not save if form is invalid', () => {
    component.form.patchValue({
      title: '',
      description: '',
    });

    component.save();
    expect(addSpy).not.toHaveBeenCalled();
  });

  it('should call add when form is valid', () => {
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

    component.save();
    expect(addSpy).toHaveBeenCalled();
  });

  it('should reset form after successful save', () => {
    component.form.patchValue({
      title: 'Test Menu',
      description: 'Test Description',
    });

    component.save();

    expect(component.form.get('title')?.value).toBe(null);
    expect(component.form.get('categoryName')?.value).toBe('Sem categoria');
  });

  it('should process cover file upload', () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const event = {
      target: {
        files: [file]
      }
    } as any;

    component.onCoverFile(event);

    expect(component.form.get('cover')?.value).toContain('blob:');
  });

  it('should normalize category name', () => {
    component.form.patchValue({
      title: 'Test Menu',
      description: 'Test Description',
      categoryName: 'ALMOÇO',
    });

    component.save();

    const callArg = addSpy.mock.calls[0][0];
    expect(callArg.category.name).toBe('Almoço');
    expect(callArg.category.id).toBe('almoço');
  });
});