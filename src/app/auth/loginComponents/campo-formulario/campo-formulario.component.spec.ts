import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { CampoFormularioComponent } from './campo-formulario.component';

describe('CampoFormularioComponent', () => {
  let component: CampoFormularioComponent;
  let fixture: ComponentFixture<CampoFormularioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampoFormularioComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CampoFormularioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve renderizar placeholder', () => {
    component.placeholder = 'Digite email';
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(input.placeholder).toBe('Digite email');
  });

  it('deve emitir valueChange quando digitar', () => {
    const spy = spyOn(component.valueChange, 'emit');

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;

    input.value = 'teste@email.com';
    input.dispatchEvent(new Event('input'));

    expect(spy).toHaveBeenCalledWith('teste@email.com');
  });

  it('deve mostrar mensagem de erro quando error existir', () => {
    component.error = 'Campo obrigatório';
    fixture.detectChanges();

    const p = fixture.debugElement.query(By.css('.error-text'));
    expect(p).toBeTruthy();
    expect(p.nativeElement.textContent).toContain('Campo obrigatório');
  });

  it('campoSenha=true deve renderizar botão olho', () => {
    component.campoSenha = true;
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('.btn-olho'));
    expect(btn).toBeTruthy();
  });

  it('ao clicar no botão olho, deve alternar senhaVisivel', () => {
    component.campoSenha = true;
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('.btn-olho')).nativeElement as HTMLButtonElement;

    expect(component.senhaVisivel).toBeFalse();
    btn.click();
    fixture.detectChanges();
    expect(component.senhaVisivel).toBeTrue();
  });
});
