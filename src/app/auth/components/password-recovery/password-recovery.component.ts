import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmailService } from '../../services/email/email.service';
import { FormFieldComponent } from '../form-field/form-field.component';
import { LogoComponent } from '../logo/logo.component';
import { PrimaryButtonComponent } from '../primary-button/primary-button.component';
import { LoggerService } from '../../services/logger.service';

type RecoveryForm = FormGroup<{
  email: FormControl<string>;
}>;

@Component({
  selector: 'app-password-recovery',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LogoComponent, FormFieldComponent, PrimaryButtonComponent],
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.css'],
})
export class PasswordRecoveryComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();

  recoveryForm: RecoveryForm;
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private emailService: EmailService,
    private logger: LoggerService,
  ) {
    this.recoveryForm = this.fb.group({
      email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    });
  }

  get emailControl() {
    return this.recoveryForm.get('email');
  }

  goToLogin() {
    // PT-BR: limpa estado para não reabrir o modal com mensagens antigas.
    this.recoveryForm.reset({ email: '' });
    this.errorMessage = null;
    this.successMessage = null;
    this.loading = false;
    this.close.emit();
  }

  async onSubmit() {
    this.recoveryForm.markAllAsTouched();
    if (this.recoveryForm.invalid) return;

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      const { email } = this.recoveryForm.getRawValue();
      await this.emailService.sendPasswordRecovery(email);

      // PT-BR: mantém feedback no próprio componente para reduzir acoplamento com serviço global.
      this.successMessage = 'Link de recuperação enviado. Verifique seu e-mail.';
      setTimeout(() => this.goToLogin(), 2000);
    } catch (e) {
      this.errorMessage = 'Não foi possível enviar o e-mail. Tente novamente.';
      this.logger.error('Erro ao enviar e-mail de recuperação:', e);
    } finally {
      this.loading = false;
    }
  }
}
