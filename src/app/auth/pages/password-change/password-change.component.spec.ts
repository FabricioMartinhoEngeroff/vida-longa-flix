import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PasswordChangeComponent } from './password-change.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('PasswordChangeComponent', () => {
  let component: PasswordChangeComponent;
  let fixture: ComponentFixture<PasswordChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordChangeComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should start with invalid form', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should require matching passwords', () => {
    component.form.patchValue({
      newPassword: 'StrongPass123!',
      confirmPassword: 'DifferentPass123!'
    });

    expect(component.form.get('newPassword')?.value).not.toBe(
      component.form.get('confirmPassword')?.value
    );
  });

  it('should validate strong password requirement', () => {
    const passwordControl = component.form.get('newPassword');
    
    passwordControl?.setValue('weak');
    expect(passwordControl?.hasError('senhaFraca')).toBe(true);
    
    passwordControl?.setValue('StrongPass123!');
    expect(passwordControl?.hasError('senhaFraca')).toBe(false);
  });

  it('should show validating state initially', () => {
    expect(component.validatingToken).toBe(true);
  });
});