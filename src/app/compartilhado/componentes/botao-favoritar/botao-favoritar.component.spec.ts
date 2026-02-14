import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

import { BotaoFavoritarComponent } from './botao-favoritar.component';

describe('BotaoFavoritarComponent', () => {
  let component: BotaoFavoritarComponent;
  let fixture: ComponentFixture<BotaoFavoritarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotaoFavoritarComponent], 
    }).compileComponents();

    fixture = TestBed.createComponent(BotaoFavoritarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit aoClicar on click', () => {
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.aoClicar, 'emit');

    const button = fixture.debugElement.query(By.css('button.botao'));
    button.triggerEventHandler('click', null);

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should not have favorito class when favorito=false', () => {
    component.favorito = false;
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button.botao');
    expect(button.classList.contains('favorito')).toBe(false);
  });

  it('should have favorito class when favorito=true', () => {
    component.favorito = true;
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button.botao');
    expect(button.classList.contains('favorito')).toBe(true);
  });

  it('should render correct icon depending on favorito value', () => {
    component.favorito = false;
    fixture.detectChanges();

    let icon = fixture.nativeElement.querySelector('mat-icon') as HTMLElement;
    expect(icon.textContent?.trim()).toBe('favorite_border');
  });

  it('should render filled icon when favorito=true', () => {
    component.favorito = true;
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('mat-icon') as HTMLElement;
    expect(icon.textContent?.trim()).toBe('favorite');
  });
});
