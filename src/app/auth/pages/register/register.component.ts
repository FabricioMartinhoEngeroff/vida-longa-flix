import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FormFieldComponent } from '../../components/form-field/form-field.component';
import { PrimaryButtonComponent } from '../../components/primary-button/primary-button.component';
import { PasswordStrengthIndicatorComponent } from '../../components/password-strength-indicator/password-strength-indicator.component';
import { EmailAdjustmentMessageComponent } from '../../components/email-adjustment-message/email-adjustment-message.component';
import { getDefaultNotificationDuration, NotificationService } from '../../services/notification.service';
import { EmailErrorType } from '../../types/form.types';

import { PasswordStrength, strongPasswordValidator } from '../../utils/strong-password-validator';
import { AuthService } from '../../services/auth.service';
import { DEFAULT_MESSAGES } from '../../../shared/services/alert-message/default-messages.constants';



@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    FormFieldComponent,
    PrimaryButtonComponent,
    PasswordStrengthIndicatorComponent,
    EmailAdjustmentMessageComponent 
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  loading = false;
  form: any;

  emailErrorType: EmailErrorType = null;
  emailErrorMessage?: string;
  problematicDomain?: string;

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
   
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        strongPasswordValidator(PasswordStrength.STRONG)
      ]],
    });

    
    this.form.get('email')?.valueChanges.subscribe(() => {
      this.updateEmailError();
    });
  }

  get currentPassword(): string {
    return this.form.get('password')?.value || '';
  }

  get f() {
    return this.form.controls;
  }

  private updateEmailError() {
    const emailControl = this.form.get('email');
    
    if (!emailControl || !emailControl.touched) {
      this.emailErrorType = null;
      return;
    }

    const errors = emailControl.errors;
    
    if (errors?.['emailTemporario']) {
      this.emailErrorType = 'temporary';
      this.emailErrorMessage = errors['emailTemporario'].message;
      this.problematicDomain = errors['emailTemporario'].domain;
    } else if (errors?.['emailSuspeito']) {
      this.emailErrorType = 'suspicious';
      this.emailErrorMessage = errors['emailSuspeito'].message;
      this.problematicDomain = errors['emailSuspeito'].domain;
    } else if (errors?.['emailInvalido']) {
      this.emailErrorType = 'invalid';
      this.emailErrorMessage = errors['emailInvalido'].message;
    } else {
      this.emailErrorType = null;
    }
  }

  fieldError(path: string): string | null {
    const control = this.form.get(path);
    if (!control || !control.touched || !control.errors) return null;

    // PT-BR: mensagens de validacao exibidas abaixo dos campos.
    if (control.errors['required']) return 'Campo obrigatório';
    if (control.errors['email']) return 'E-mail inválido';
    if (control.errors['minlength'])
      return `Mínimo de ${control.errors['minlength'].requiredLength} caracteres`;
    if (control.errors['pattern']) return 'Telefone inválido';

    if (control.errors['senhaFraca']) {
      const requirements = control.errors['senhaFraca'].requisitosFaltando;
      if (requirements && requirements.length > 0) {
        return requirements[0];
      }
      return 'A senha não atende aos requisitos de segurança';
    }

    return 'Valor inválido';
  }

  async register() {
    this.form.markAllAsTouched();
    this.updateEmailError();

    const emailControl = this.form.get('email');
    if (emailControl?.errors?.['emailTemporario'] || emailControl?.errors?.['emailSuspeito']) {
      this.notificationService.showDefault(DEFAULT_MESSAGES.INVALID_EMAIL);
      return;
    }
  
    const passwordControl = this.form.get('password');
    if (passwordControl?.errors?.['senhaFraca']) {
      const requirements = passwordControl.errors['senhaFraca'].requisitosFaltando;
      if (requirements && requirements.length > 0) {
        this.notificationService.warning(requirements[0]);
        return;
      }
    }
  
    if (this.form.invalid) {
      this.notificationService.showDefault(DEFAULT_MESSAGES.FIX_ERRORS);
      return;
    }

    this.loading = true;

    try {
      const data = this.form.getRawValue();
      await this.authService.register(data);

      this.notificationService.showDefault(DEFAULT_MESSAGES.REGISTRATION_SUCCESS);

      setTimeout(() => {
        this.router.navigateByUrl('/app', { replaceUrl: true });
      }, getDefaultNotificationDuration('success'));

    } catch (e: any) {
      this.notificationService.error(e.message || DEFAULT_MESSAGES.GENERIC_ERROR.text);
      console.error(e);
    } finally {
      this.loading = false;
    }
  }
}
