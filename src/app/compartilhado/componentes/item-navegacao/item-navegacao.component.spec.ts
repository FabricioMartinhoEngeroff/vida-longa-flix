import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

import { ItemNavegacaoComponent } from './item-navegacao.component';

describe('ItemNavegacaoComponent', () => {
  let component: ItemNavegacaoComponent;
  let fixture: ComponentFixture<ItemNavegacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemNavegacaoComponent], 
    }).compileComponents();

    fixture = TestBed.createComponent(ItemNavegacaoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render text and icon', () => {
    component.texto = 'Início';
    component.icone = 'home';
    component.ativo = false;
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;

    expect(el.textContent).toContain('Início');

    const icone = el.querySelector('mat-icon.icone') as HTMLElement;
    expect(icone).toBeTruthy();
    expect(icone.textContent?.trim()).toBe('home');
  });

  it('should emit aoClicar when clicked', () => {
    component.texto = 'Início';
    component.icone = 'home';
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.aoClicar, 'emit');

    const button = fixture.debugElement.query(By.css('.item'));
    button.triggerEventHandler('click', null);

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should apply ativo class when ativo=true', () => {
    component.texto = 'Início';
    component.icone = 'home';
    component.ativo = true;
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const item = el.querySelector('.item');

    expect(item?.classList.contains('ativo')).toBe(true);
  });
});
