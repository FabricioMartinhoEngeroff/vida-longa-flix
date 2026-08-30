import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { FormFieldComponent } from '../../components/form-field/form-field.component';
import { PasswordRecoveryComponent } from '../../components/password-recovery/password-recovery.component';
import { PrimaryButtonComponent } from '../../components/primary-button/primary-button.component';
import { AuthService } from '../../services/auth.service';
import { LoginForm } from '../../types/form.types';
import { LoggerService } from '../../services/logger.service';
import { getFieldError } from '../../utils/form-errors';

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
  form!: FormGroup<LoginForm>;
  recoveryOpen = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private logger: LoggerService
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
    return getFieldError(this.form.get(field));  // ← uma linha
  }

  async signIn() {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    this.loading = true;

    try {
      const { email, password, keepLoggedIn } = this.form.getRawValue();
      await this.authService.login(email, password, keepLoggedIn);
      this.router.navigateByUrl('/app', { replaceUrl: true });
    } catch (e) {
      this.logger.error('Erro ao realizar login:', e);
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