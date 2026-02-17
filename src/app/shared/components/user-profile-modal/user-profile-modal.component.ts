import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../services/alert-message/alert-message.service';
import { DEFAULT_MESSAGES } from '../../services/alert-message/default-messages.constants';
import { FormFieldComponent } from '../../../auth/components/form-field/form-field.component';


@Component({
  selector: 'app-user-profile-modal',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, FormFieldComponent],
  templateUrl: './user-profile-modal.component.html',
  styleUrls: ['./user-profile-modal.component.css']
})
export class UserProfileModalComponent implements OnInit {
  @Input() open = false;
  @Input() user: any;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  @Output() openChangePassword = new EventEmitter<void>();

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService 
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: [this.user?.name || '', [Validators.required, Validators.minLength(3)]],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      taxId: [this.user?.taxId || '', [Validators.minLength(11)]],
      phone: [this.user?.phone || ''],
      address: this.fb.group({
        street: [this.user?.address?.street || ''],
        number: [this.user?.address?.number || ''],
        neighborhood: [this.user?.address?.neighborhood || ''],
        city: [this.user?.address?.city || ''],
        state: [this.user?.address?.state || ''],
        zipCode: [this.user?.address?.zipCode || '']
      })
    });
  }

  get addressControls() {
    return (this.form.get('address') as FormGroup).controls;
  }

  fieldError(path: string): string | null {
    const control = this.form.get(path);
    if (!control || !control.touched || !control.errors) return null;

    if (control.errors['required']) return 'Campo obrigatório';
    if (control.errors['email']) return 'E-mail inválido';
    if (control.errors['minlength'])
      return `Mínimo de ${control.errors['minlength'].requiredLength} caracteres`;

    return 'Valor inválido';
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.notificationService.showDefault(DEFAULT_MESSAGES.REQUIRED_FIELDS);
      return;
    }

    const data = this.form.getRawValue();
    this.save.emit(data);
  }

  onOpenChangePassword() {
    this.openChangePassword.emit();
  }
}