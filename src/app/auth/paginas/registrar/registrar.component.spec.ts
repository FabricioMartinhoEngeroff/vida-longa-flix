import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarComponent } from './registrar.component';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { ServicoAutenticacao } from '../../api/servico-autenticacao';


describe('RegistrarComponent', () => {
  let component: RegistrarComponent;
  let fixture: ComponentFixture<RegistrarComponent>;

  const authMock = {
  register: vi.fn().mockResolvedValue({ token: 'token-teste' }),
};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarComponent],
      providers: [
        provideRouter([]),
        { provide: ServicoAutenticacao, useValue: authMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve invalidar quando formulario vazio', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('deve validar quando preencher campos obrigatorios', () => {
    component.form.setValue({
      nome: 'Fabricio Teta',
      email: 'fabricio@email.com',
      telefone: '11987654321',
      senha: 'SenhaForte1!',
    });

    expect(component.form.valid).toBe(true);
  });

  it('deve invalidar quando telefone estiver vazio', () => {
    component.form.setValue({
      nome: 'Fabricio Teta',
      email: 'fabricio@email.com',
      telefone: '',
      senha: 'SenhaForte1!',
    });

    expect(component.form.invalid).toBe(true);
    expect(component.form.get('telefone')?.errors?.['required']).toBe(true);
  });
});
