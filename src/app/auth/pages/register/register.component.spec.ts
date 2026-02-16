import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from '../../api/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  const authMock = {
    register: vi.fn().mockResolvedValue({ token: 'test-token' }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should invalidate when form is empty', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should validate when filling required fields', () => {
    component.form.setValue({
      name: 'Fabricio Teta',
      email: 'fabricio@email.com',
      phone: '11987654321',
      password: 'StrongPass1!',
    });

    expect(component.form.valid).toBe(true);
  });

  it('should invalidate when phone is empty', () => {
    component.form.setValue({
      name: 'Fabricio Teta',
      email: 'fabricio@email.com',
      phone: '',
      password: 'StrongPass1!',
    });

    expect(component.form.invalid).toBe(true);
    expect(component.form.get('phone')?.errors?.['required']).toBe(true);
  });
});