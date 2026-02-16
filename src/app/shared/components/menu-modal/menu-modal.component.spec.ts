import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { MenuModalComponent } from './menu-modal.component';
import { Menu } from '../../types/menus.types';

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
    proteins: 10,
    carbs: 20,
    fats: 5,
    fiber: 3,
    calories: 200,
    favorited: false
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
    
    expect(macros.textContent).toContain('Proteínas: 10g');
    expect(macros.textContent).toContain('Carboidratos: 20g');
    expect(macros.textContent).toContain('Gorduras: 5g');
    expect(macros.textContent).toContain('Fibras: 3g');
    expect(macros.textContent).toContain('Calorias: 200 kcal');
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
});