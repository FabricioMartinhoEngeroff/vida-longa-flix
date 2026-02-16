import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormFieldComponent } from '../../component/form-field/form-field.component';
import { PrimaryButtonComponent } from '../../component/primary-button/primary-button.component';
import { PasswordIndicatorComponent } from '../../component/password-indicator/password-indicator.component';
import { NotificationService, getDefaultNotificationDuration } from '../../services/notification.service';
import { PasswordStrength, strongPasswordValidator } from '../../utils/strong-password-validator';
import { PasswordRecoveryService } from '../../services/password-recovery.service';
import { DEFAULT_MESSAGES } from '../../../shared/services/alert-message/default-messages.constants';

@Component({
  selector: 'app-password-change',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    FormFieldComponent,
    PrimaryButtonComponent,
    PasswordIndicatorComponent,
  ],
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.css'],
})
export class PasswordChangeComponent implements OnInit {
  form: FormGroup;
  loading = false;
  validatingToken = true;
  tokenValid = false;
  token = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private recoveryService: PasswordRecoveryService
  ) {
    this.form = this.fb.group({
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          strongPasswordValidator(PasswordStrength.STRONG),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    });
  }

  async ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'];

    if (!this.token) {
      this.notificationService.showDefault(DEFAULT_MESSAGES.INVALID_TOKEN);
      this.tokenValid = false;
      this.validatingToken = false;
      setTimeout(() => this.router.navigate(['/login']), getDefaultNotificationDuration('error'));
      return;
    }

    try {
      this.tokenValid = await this.recoveryService.validateToken(this.token);

      if (!this.tokenValid) {
        this.notificationService.showDefault(DEFAULT_MESSAGES.INVALID_TOKEN);
        setTimeout(() => this.router.navigate(['/login']), getDefaultNotificationDuration('error'));
      }
    } catch (e) {
      this.notificationService.showDefault(DEFAULT_MESSAGES.ERROR_VALIDATING_TOKEN);
      this.tokenValid = false;
    } finally {
      this.validatingToken = false;
    }
  }

  get currentPassword(): string {
    return this.form.get('newPassword')?.value || '';
  }

  fieldError(path: string): string | null {
    const control = this.form.get(path);
    if (!control || !control.touched || !control.errors) return null;

    if (control.errors['required']) return 'Required field';
    if (control.errors['minlength']) {
      return 'Minimum ' + control.errors['minlength'].requiredLength + ' characters';
    }

    if (control.errors['senhaFraca']) {
      const requirements = control.errors['senhaFraca'].requisitosFaltando;
      if (requirements && requirements.length > 0) {
        return requirements[0];
      }
      return 'Password does not meet security requirements';
    }

    return 'Invalid value';
  }

 async change() {
  this.form.markAllAsTouched();

  if (this.form.invalid) {
    this.notificationService.showDefault(DEFAULT_MESSAGES.FIX_ERRORS);
    return;
  }

  const { newPassword, confirmPassword } = this.form.getRawValue();

  if (newPassword !== confirmPassword) {
    this.notificationService.showDefault(DEFAULT_MESSAGES.PASSWORDS_DO_NOT_MATCH);
    return;
  }

  this.loading = true;

  try {
    await this.recoveryService.changePassword(this.token, newPassword);

    this.notificationService.showDefault(DEFAULT_MESSAGES.PASSWORD_CHANGED);

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, getDefaultNotificationDuration('success'));
  } catch (e) {
    this.notificationService.showDefault(DEFAULT_MESSAGES.ERROR_RESETTING_PASSWORD);
    console.error(e);
  } finally {
    this.loading = false;
  }
}}