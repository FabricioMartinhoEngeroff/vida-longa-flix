import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { calculatePasswordStrength, PasswordStrength } from '../../../auth/utils/strong-password-validator';
import { NotificationService } from '../../services/alert-message/alert-message.service';
import { DEFAULT_MESSAGES } from '../../services/alert-message/default-messages.constants';
import { PasswordStrengthIndicatorComponent } from '../../../auth/component/password-strength-indicator/password-strength-indicator.component';

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [FormsModule, MatIconModule, PasswordStrengthIndicatorComponent],
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.css'],
})
export class ChangePasswordModalComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ currentPassword: string; newPassword: string }>();

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmation = false;

  error = '';

  constructor(private notificationService: NotificationService) {}

  onClose(): void {
    this.clearFields();
    this.close.emit();
  }

  // ✅ Mantém tua lógica original (tu chamou de "firm")
  firm(): void {
    this.error = '';

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.error = 'Preencha todos os campos';
      return;
    }

    if (this.newPassword.length < 8) {
      this.error = 'Nova senha deve ter no mínimo 8 caracteres';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'As senhas digitadas não são iguais';
      return;
    }

    if (this.currentPassword === this.newPassword) {
      this.error = 'A nova senha deve ser diferente da atual';
      return;
    }

    const result = calculatePasswordStrength(this.newPassword);

    if (result.strength < PasswordStrength.STRONG) {
      if (result.missingRequirements && result.missingRequirements.length > 0) {
        this.error = result.missingRequirements[0];
        this.notificationService.warning(result.missingRequirements[0]);
      } else {
        this.error = 'Senha precisa ser forte';
        this.notificationService.showDefault(DEFAULT_MESSAGES.WEAK_PASSWORD);
      }
      return;
    }

    this.confirm.emit({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
    });

    this.clearFields();
  }

  // ✅ Alias pra NÃO quebrar teu HTML/spec que chamam onConfirm()
  onConfirm(): void {
    this.firm();
  }

  clearFields(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.error = '';
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmation = false;
  }

  toggleShowPassword(field: 'current' | 'new' | 'confirmation'): void {
    if (field === 'current') this.showCurrentPassword = !this.showCurrentPassword;
    if (field === 'new') this.showNewPassword = !this.showNewPassword;
    if (field === 'confirmation') this.showConfirmation = !this.showConfirmation;
  }
}
