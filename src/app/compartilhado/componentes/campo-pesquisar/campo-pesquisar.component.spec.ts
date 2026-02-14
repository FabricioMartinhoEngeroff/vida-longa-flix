import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

import { CampoPesquisarComponent } from './campo-pesquisar.component';

describe('CampoPesquisarComponent', () => {
  let component: CampoPesquisarComponent;
  let fixture: ComponentFixture<CampoPesquisarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampoPesquisarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CampoPesquisarComponent);
    component = fixture.componentInstance;
    component.placeholder = 'Pesquisar...';
    component.value = '';
    component.disabled = false;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open when abrir is called', () => {
    component.abrir();
    expect(component.aberto).toBe(true);
  });

  it('should render search overlay when aberto=true', () => {
    component.aberto = true;
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.busca-overlay'))).toBeTruthy();
  });

  it('should render input with placeholder when opened', () => {
    component.aberto = true;
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input.busca-input')).nativeElement as HTMLInputElement;
    expect(input.placeholder).toBe('Pesquisar...');
  });

  it('should emit valueChange when typing', () => {
    component.aberto = true;
    fixture.detectChanges();

    const emitSpy = vi.spyOn(component.valueChange, 'emit');

    const input = fixture.debugElement.query(By.css('input.busca-input')).nativeElement as HTMLInputElement;
    input.value = 'banana';
    input.dispatchEvent(new Event('input'));

    expect(emitSpy).toHaveBeenCalledWith('banana');
  });

  it('should emit buscar when confirmarBusca has non-empty term', () => {
    const emitSpy = vi.spyOn(component.buscar, 'emit');

    component.value = '  banana  ';
    component.confirmarBusca();

    expect(emitSpy).toHaveBeenCalledWith('banana');
    expect(component.aberto).toBe(false);
  });

  it('should not open when disabled', () => {
    component.disabled = true;

    component.abrir();

    expect(component.aberto).toBe(false);
  });
});
