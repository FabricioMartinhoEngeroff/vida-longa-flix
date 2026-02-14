import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarComponent } from './registrar.component';
import { provideRouter } from '@angular/router';

describe('RegistrarComponent', () => {
  let component: RegistrarComponent;
  let fixture: ComponentFixture<RegistrarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarComponent],
      providers: [provideRouter([])],
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
      senha: 'SenhaForte1!',
    });

    expect(component.form.valid).toBe(true);
  });
});
