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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open when open is called', () => {
    component.open();
    expect(component.isOpen).toBe(true);
  });

  it('should render search overlay when isOpen=true', () => {
    component.isOpen = true;
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.search-overlay'))).toBeTruthy();
  });

  it('should render input with placeholder when opened', () => {
    component.isOpen = true;
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input.search-input')).nativeElement as HTMLInputElement;
    expect(input.placeholder).toBe('Pesquisar...');
  });

  it('should emit valueChange when typing', () => {
    component.isOpen = true;
    fixture.detectChanges();

    const emitSpy = vi.spyOn(component.valueChange, 'emit');

    const input = fixture.debugElement.query(By.css('input.search-input')).nativeElement as HTMLInputElement;
    input.value = 'banana';
    input.dispatchEvent(new Event('input'));

    expect(emitSpy).toHaveBeenCalledWith('banana');
  });

  it('should emit search when confirmSearch has non-empty term', () => {
    const emitSpy = vi.spyOn(component.search, 'emit');

    component.value = '  banana  ';
    component.confirmSearch();

    expect(emitSpy).toHaveBeenCalledWith('banana');
    expect(component.isOpen).toBe(false);
  });

  it('should not open when disabled', () => {
    component.disabled = true;

    component.open();

    expect(component.isOpen).toBe(false);
  });
});
