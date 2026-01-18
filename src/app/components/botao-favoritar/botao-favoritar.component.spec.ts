import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
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

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit aoClicar on click', () => {
    spyOn(component.aoClicar, 'emit');

    const button = fixture.debugElement.query(By.css('button.botao'));
    button.triggerEventHandler('click', null);

    expect(component.aoClicar.emit).toHaveBeenCalled();
  });

  it('should not have favorito class when favorito=false', () => {
    component.favorito = false;
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button.botao');
    expect(button.classList.contains('favorito')).toBeFalse();
  });

  it('should have favorito class when favorito=true', () => {
    component.favorito = true;
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button.botao');
    expect(button.classList.contains('favorito')).toBeTrue();
  });

  it('should render correct icon depending on favorito value', () => {
    component.favorito = false;
    fixture.detectChanges();

    let icon = fixture.nativeElement.querySelector('mat-icon') as HTMLElement;
    expect(icon.textContent?.trim()).toBe('favorite_border');

    component.favorito = true;
    fixture.detectChanges();

    icon = fixture.nativeElement.querySelector('mat-icon') as HTMLElement;
    expect(icon.textContent?.trim()).toBe('favorite');
  });
});
