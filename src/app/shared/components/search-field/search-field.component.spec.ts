import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

import { SearchFieldComponent } from './search-field.component';

describe('SearchFieldComponent', () => {
  let component: SearchFieldComponent;
  let fixture: ComponentFixture<SearchFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFieldComponent);
    component = fixture.componentInstance;
    component.placeholder = 'Pesquisar...';
    component.value = '';
    component.disabled = false;
  });

  // ── B1. Renderizacao e abertura ──

  it('B1.1 — should render search button with magnifying glass icon', () => {
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('.search-button'));
    expect(btn).toBeTruthy();
    expect(btn.nativeElement.querySelector('mat-icon')).toBeTruthy();
  });

  it('B1.2 — should open modal overlay when button is clicked', () => {
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('.search-button')).nativeElement as HTMLButtonElement;
    btn.click();
    fixture.detectChanges();

    expect(component.isOpen).toBe(true);
    expect(fixture.debugElement.query(By.css('.search-overlay'))).toBeTruthy();
  });

  it('B1.3 — should render input with placeholder when opened', () => {
    component.isOpen = true;
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input.search-input')).nativeElement as HTMLInputElement;
    expect(input.placeholder).toBe('Pesquisar...');
  });

  it('B1.4 — should close modal when clicking overlay', () => {
    component.isOpen = true;
    fixture.detectChanges();

    const overlay = fixture.debugElement.query(By.css('.search-overlay')).nativeElement as HTMLElement;
    overlay.click();
    fixture.detectChanges();

    expect(component.isOpen).toBe(false);
    expect(fixture.debugElement.query(By.css('.search-overlay'))).toBeFalsy();
  });

  it('B1.5 — should close modal when clicking close button', () => {
    component.isOpen = true;
    fixture.detectChanges();

    const closeBtn = fixture.debugElement.query(By.css('button.close')).nativeElement as HTMLButtonElement;
    closeBtn.click();
    fixture.detectChanges();

    expect(component.isOpen).toBe(false);
  });

  it('B1.6 — should NOT open when disabled', () => {
    component.disabled = true;
    component.open();
    expect(component.isOpen).toBe(false);
  });

  // ── B2. Digitacao e emissao de eventos ──

  it('B2.7 — should emit valueChange when typing', () => {
    component.isOpen = true;
    fixture.detectChanges();

    const emitSpy = vi.spyOn(component.valueChange, 'emit');
    const input = fixture.debugElement.query(By.css('input.search-input')).nativeElement as HTMLInputElement;
    input.value = 'banana';
    input.dispatchEvent(new Event('input'));

    expect(emitSpy).toHaveBeenCalledWith('banana');
  });

  it('B2.8 — should emit search on Enter with non-empty text and close modal', () => {
    const searchSpy = vi.spyOn(component.search, 'emit');
    component.isOpen = true;
    component.value = 'banana';

    component.confirmSearch();

    expect(searchSpy).toHaveBeenCalledWith('banana');
    expect(component.isOpen).toBe(false);
  });

  it('B2.9 — should NOT emit search on Enter with empty/whitespace input', () => {
    const searchSpy = vi.spyOn(component.search, 'emit');
    component.value = '   ';

    component.confirmSearch();

    expect(searchSpy).not.toHaveBeenCalled();
    expect(component.isOpen).toBe(false);
  });

  it('B2.10 — should trim spaces when emitting search on Enter', () => {
    const searchSpy = vi.spyOn(component.search, 'emit');
    component.value = '  banana  ';

    component.confirmSearch();

    expect(searchSpy).toHaveBeenCalledWith('banana');
  });

  it('B2 — should emit search via keyup.enter in template', async () => {
    const searchSpy = vi.spyOn(component.search, 'emit');
    component.isOpen = true;
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.debugElement.query(By.css('input.search-input')).nativeElement as HTMLInputElement;
    input.value = 'teste enter';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
    fixture.detectChanges();

    expect(searchSpy).toHaveBeenCalledWith('teste enter');
    expect(component.isOpen).toBe(false);
  });

  // ── B3. Exibicao de sugestoes e categorias ──

  it('B3.11 — should render suggestions section with pill buttons', () => {
    component.isOpen = true;
    component.suggestions = ['Banana Smoothie', 'Banana Split'];
    fixture.detectChanges();

    const sections = fixture.debugElement.queryAll(By.css('.search-section'));
    const suggestionsSection = sections.find(
      s => s.nativeElement.textContent.includes('Sugestões')
    );
    expect(suggestionsSection).toBeTruthy();

    const pills = suggestionsSection!.queryAll(By.css('.search-item'));
    expect(pills.length).toBe(2);
    expect(pills[0].nativeElement.textContent.trim()).toBe('Banana Smoothie');
    expect(pills[1].nativeElement.textContent.trim()).toBe('Banana Split');
  });

  it('B3.12 — should render categories section with pill buttons', () => {
    component.isOpen = true;
    component.categories = ['Bebidas', 'Sobremesas'];
    fixture.detectChanges();

    const sections = fixture.debugElement.queryAll(By.css('.search-section'));
    const catSection = sections.find(
      s => s.nativeElement.textContent.includes('Categorias')
    );
    expect(catSection).toBeTruthy();

    const pills = catSection!.queryAll(By.css('.search-item'));
    expect(pills.length).toBe(2);
  });

  it('B3.13 — should NOT render any section when suggestions and categories are empty', () => {
    component.isOpen = true;
    component.suggestions = [];
    component.categories = [];
    fixture.detectChanges();

    const sections = fixture.debugElement.queryAll(By.css('.search-section'));
    expect(sections.length).toBe(0);
  });

  it('B3.14 — should call choose() when clicking a suggestion pill', () => {
    const searchSpy = vi.spyOn(component.search, 'emit');
    const valueSpy = vi.spyOn(component.valueChange, 'emit');

    component.isOpen = true;
    component.suggestions = ['Banana Smoothie'];
    fixture.detectChanges();

    const pill = fixture.debugElement.queryAll(By.css('.search-item'))[0].nativeElement as HTMLButtonElement;
    pill.click();
    fixture.detectChanges();

    expect(valueSpy).toHaveBeenCalledWith('Banana Smoothie');
    expect(searchSpy).toHaveBeenCalledWith('Banana Smoothie');
    expect(component.value).toBe('Banana Smoothie');
    expect(component.isOpen).toBe(false);
  });

  it('B3.15 — should call choose() when clicking a category pill', () => {
    const searchSpy = vi.spyOn(component.search, 'emit');
    const valueSpy = vi.spyOn(component.valueChange, 'emit');

    component.isOpen = true;
    component.categories = ['Bebidas'];
    component.suggestions = [];
    fixture.detectChanges();

    const pill = fixture.debugElement.query(By.css('.search-item')).nativeElement as HTMLButtonElement;
    pill.click();
    fixture.detectChanges();

    expect(valueSpy).toHaveBeenCalledWith('Bebidas');
    expect(searchSpy).toHaveBeenCalledWith('Bebidas');
    expect(component.isOpen).toBe(false);
  });

  // ── B14. Estado do modal entre aberturas ──

  it('B14.65 — should persist input value after close and reopen', () => {
    component.open();
    component.value = 'ban';
    component.close();
    expect(component.isOpen).toBe(false);

    component.open();
    expect(component.value).toBe('ban');
  });

  it('B14.66 — should keep suggestions visible after close and reopen', () => {
    component.suggestions = ['Banana Smoothie'];
    component.open();
    component.close();

    component.open();
    fixture.detectChanges();

    // suggestions array is still set — the parent (header) controls it
    expect(component.suggestions).toEqual(['Banana Smoothie']);
    const pills = fixture.debugElement.queryAll(By.css('.search-item'));
    expect(pills.length).toBe(1);
  });

  it('B14.67 — should show chosen text in value after reopen', () => {
    component.isOpen = true;
    component.suggestions = ['Banana Smoothie'];
    fixture.detectChanges();

    component.choose('Banana Smoothie');
    expect(component.isOpen).toBe(false);
    expect(component.value).toBe('Banana Smoothie');

    component.open();
    fixture.componentRef.changeDetectorRef.detectChanges();
    const input = fixture.debugElement.query(By.css('input.search-input')).nativeElement as HTMLInputElement;
    expect(input.value).toBe('Banana Smoothie');
  });

  // ── B18. Acessibilidade (parcial) ──

  it('B18.86 — search button should have aria-label="Pesquisar"', () => {
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('.search-button')).nativeElement as HTMLButtonElement;
    expect(btn.getAttribute('aria-label')).toBe('Pesquisar');
  });

  it('B18.89 — suggestion pills should be focusable buttons', () => {
    component.isOpen = true;
    component.suggestions = ['Item A', 'Item B'];
    fixture.detectChanges();

    const pills = fixture.debugElement.queryAll(By.css('.search-item'));
    pills.forEach(pill => {
      expect(pill.nativeElement.tagName).toBe('BUTTON');
    });
  });

  it('B18.90 — suggestion pill text should be the item name (screen reader accessible)', () => {
    component.isOpen = true;
    component.suggestions = ['Banana Smoothie'];
    fixture.detectChanges();

    const pill = fixture.debugElement.query(By.css('.search-item')).nativeElement;
    expect(pill.textContent.trim()).toBe('Banana Smoothie');
  });

  // ── B19. Interacao input — paste e composicao ──

  it('B19.91 — should handle paste by firing input event', () => {
    component.isOpen = true;
    fixture.detectChanges();

    const valueSpy = vi.spyOn(component.valueChange, 'emit');
    const input = fixture.debugElement.query(By.css('input.search-input')).nativeElement as HTMLInputElement;

    input.value = 'banana';
    input.dispatchEvent(new Event('input'));

    expect(valueSpy).toHaveBeenCalledWith('banana');
    expect(component.value).toBe('banana');
  });

  it('B19 — should update value via onInput correctly', () => {
    const event = { target: { value: 'colado via paste' } } as unknown as Event;
    component.onInput(event);

    expect(component.value).toBe('colado via paste');
  });

  // ── B12. Mobile (parcial — unit test) ──

  it('B12.56 — should emit search on Enter key (simulates mobile Go button)', async () => {
    const searchSpy = vi.spyOn(component.search, 'emit');
    component.isOpen = true;
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input.search-input')).nativeElement as HTMLInputElement;
    input.value = 'pesquisa mobile';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
    fixture.detectChanges();

    expect(searchSpy).toHaveBeenCalledWith('pesquisa mobile');
    expect(component.isOpen).toBe(false);
  });

  it('B12.57 — modal should stay open when input loses focus (blur)', () => {
    component.isOpen = true;
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input.search-input')).nativeElement as HTMLInputElement;
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(component.isOpen).toBe(true);
  });
});
