import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

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

  it('deve chamar onChange quando digitar', () => {
  fixture.detectChanges();
  const onChange = vi.fn();
  component.registerOnChange(onChange);

  const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
  input.value = 'teste@email.com';
  input.dispatchEvent(new Event('input'));

  expect(onChange).toHaveBeenCalledWith('teste@email.com');
});

  it('deve mostrar mensagem de erro quando error existir', () => {
    component.error = 'Campo obrigatório';
    fixture.detectChanges();

    const p = fixture.debugElement.query(By.css('.error')
);
    expect(p).toBeTruthy();
    expect(p.nativeElement.textContent).toContain('Campo obrigatório');
  });

 it('type=password deve renderizar botão olho', () => {
  component.type = 'password';
  fixture.detectChanges();

  const btn = fixture.debugElement.query(By.css('.right-action'));
  expect(btn).toBeTruthy();
});

it('ao clicar no botão olho, deve alternar senhaVisivel', () => {
  component.type = 'password';
  fixture.detectChanges();

  const btn = fixture.debugElement.query(By.css('.right-action')).nativeElement as HTMLButtonElement;

  expect(component.senhaVisivel).toBe(false);
  btn.click();
  fixture.detectChanges();
  expect(component.senhaVisivel).toBe(true)
});
});
