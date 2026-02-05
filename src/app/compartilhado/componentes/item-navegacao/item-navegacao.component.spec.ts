/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
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

    // inputs básicos pra renderizar certinho
    component.texto = 'Início';
    component.icone = 'assets/icones/home-ativo.png';
    component.ativo = false;

    fixture.detectChanges(); 
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render text and icon', () => {
    const el: HTMLElement = fixture.nativeElement;

    expect(el.textContent).toContain('Início');

    const img = el.querySelector('img.icone') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toContain('assets/icones/home-ativo.png');
    expect(img.getAttribute('alt')).toBe('Início');
  });

  it('should emit aoClicar when clicked', () => {
    spyOn(component.aoClicar, 'emit');

    const button = fixture.debugElement.query(By.css('.item'));
    button.triggerEventHandler('click', null);

    expect(component.aoClicar.emit).toHaveBeenCalled();
  });

  it('should apply ativo class when ativo=true', async () => {
    component.ativo = true;
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    const item = el.querySelector('.item');

    expect(item?.classList.contains('ativo')).toBe(true);
  });
});
