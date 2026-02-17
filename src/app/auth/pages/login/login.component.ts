import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { FormFieldComponent } from '../../components/form-field/form-field.component';
import { PasswordRecoveryComponent } from '../../components/password-recovery/password-recovery.component';
import { PrimaryButtonComponent } from '../../components/primary-button/primary-button.component';
import { AuthService } from '../../services/auth.service';
import { LoginForm } from '../../types/form.types';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    PrimaryButtonComponent,
    FormFieldComponent,
    PasswordRecoveryComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loading = false;
  form!: ReturnType<FormBuilder['group']>;
  recoveryOpen = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.form = this.fb.group<LoginForm>({
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
      keepLoggedIn: new FormControl(false, { nonNullable: true }),
    });
  }

  errorMessage(field: keyof LoginForm): string | null {
    const control = this.form.get(field);
    if (!control || !control.touched || !control.errors) return null;

    if (control.errors['required']) return 'Required field';
    if (control.errors['email']) return 'Invalid email';
    if (control.errors['minlength']) {
      return `Minimum ${control.errors['minlength'].requiredLength} characters`;
    }

    return 'Invalid value';
  }

  async signIn() {
    this.form.markAllAsTouched();

    // PT-BR: no login, sem NotificationService; validação visual fica no formulário.
    if (this.form.invalid) return;

    this.loading = true;

    try {
      const { email, password } = this.form.getRawValue();
      await this.authService.login(email, password);
      this.router.navigateByUrl('/app', { replaceUrl: true });
    } catch (e) {
      console.error('Erro ao realizar login:', e);
    } finally {
      this.loading = false;
    }
  }

  openPasswordRecovery() {
    this.recoveryOpen = true;
  }

  closePasswordRecovery() {
    this.recoveryOpen = false;
  }

  register() {
    this.router.navigateByUrl('/register');
  }
}
