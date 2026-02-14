import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar com form inválido', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('deve validar formulário quando preencher corretamente', () => {
    component.form.setValue({
      email: 'teste@email.com',
      password: '123456',
      manterConectado: false,
    });

    expect(component.form.valid).toBe(true);
  });
});
