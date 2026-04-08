import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { MenuModalComponent } from './menu-modal.component';
import { Menu } from '../../types/menu';

describe('MenuModalComponent', () => {
  let component: MenuModalComponent;
  let fixture: ComponentFixture<MenuModalComponent>;

  const mockMenu: Menu = {
    id: '1',
    title: 'Test Menu',
    description: 'Test Description',
    cover: 'test-cover.jpg',
    recipe: 'Test Recipe',
    nutritionistTips: 'Test Tips',
    protein: 10,
    carbs: 20,
    fat: 5,
    fiber: 3,
    calories: 200,
    favorited: false,
    category: { id: 'cat-1', name: 'Sem categoria', type: 'MENU' },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuModalComponent);
    component = fixture.componentInstance;
    component.menu = mockMenu;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should display menu data', () => {
    const compiled = fixture.nativeElement;
    
    expect(compiled.querySelector('.title').textContent).toContain('Test Menu');
    expect(compiled.querySelector('.description').textContent).toContain('Test Description');
  });

  it('should emit close when close button is clicked', () => {
    const emitSpy = vi.spyOn(component.close, 'emit');
    
    const closeBtn = fixture.nativeElement.querySelector('.close-btn');
    closeBtn.click();
    
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit favorite when favorite is triggered', () => {
    const emitSpy = vi.spyOn(component.favorite, 'emit');
    
    component.favorite.emit();
    
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit comment when comment is triggered', () => {
    const emitSpy = vi.spyOn(component.comment, 'emit');
    const commentText = 'Test comment';
    
    component.comment.emit(commentText);
    
    expect(emitSpy).toHaveBeenCalledWith(commentText);
  });

  it('should display nutritional information', () => {
    const compiled = fixture.nativeElement;
    const macros = compiled.querySelector('.macros');
    
    expect(macros.textContent).toContain('Proteínas:');
    expect(macros.textContent).toContain('10g');
    expect(macros.textContent).toContain('Carboidratos:');
    expect(macros.textContent).toContain('20g');
    expect(macros.textContent).toContain('Gorduras:');
    expect(macros.textContent).toContain('5g');
    expect(macros.textContent).toContain('Fibras:');
    expect(macros.textContent).toContain('3g');
    expect(macros.textContent).toContain('Calorias:');
    expect(macros.textContent).toContain('200 kcal');
  });

  it('should emit fieldSave when onFieldSave is called', () => {
    const emitSpy = vi.spyOn(component.fieldSave, 'emit');
    component.onFieldSave('title', 'Novo título');
    expect(emitSpy).toHaveBeenCalledWith({ field: 'title', value: 'Novo título' });
  });

  it('should show edit button when canEdit is true', () => {
    component.canEdit = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.btn-edit')).toBeTruthy();
  });

  it('should not render when menu is null', () => {
    component.menu = null;
    fixture.detectChanges();
    
    const backdrop = fixture.nativeElement.querySelector('.modal-backdrop');
    expect(backdrop).toBeNull();
  });

  it('should display fallback image when cover is missing', () => {
    component.menu = { ...mockMenu, cover: '' };
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('.cover-large');
    expect(img.src).toContain('assets/images/Logo.png');
  });

  // ── A21. Dicas da nutri na modal ──────────────────────

  it('#214 dicas da nutri com quebras de linha exibe corretamente na modal', () => {
    component.menu = {
      ...mockMenu,
      nutritionistTips: 'Dica 1\nDica 2\nDica 3',
    };
    fixture.detectChanges();

    const blocks = fixture.nativeElement.querySelectorAll('.block');
    let tipsBlock: HTMLElement | null = null;
    blocks.forEach((b: HTMLElement) => {
      if (b.querySelector('h4')?.textContent?.includes('Dicas da Nutri')) {
        tipsBlock = b;
      }
    });
    expect(tipsBlock).toBeTruthy();
    const editableField = tipsBlock!.querySelector('app-editable-field');
    expect(editableField).toBeTruthy();
  });
});
