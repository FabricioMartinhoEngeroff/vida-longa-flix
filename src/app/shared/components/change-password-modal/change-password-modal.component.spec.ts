import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ChangePasswordModalComponent } from './change-password-modal.component';
import { NotificationService } from '../../services/alert-message/alert-message.service';

describe('ChangePasswordModalComponent', () => {
  let component: ChangePasswordModalComponent;
  let fixture: ComponentFixture<ChangePasswordModalComponent>;

  const notificationMock = {
    warning: vi.fn(),
    showDefault: vi.fn(),
  };

  beforeEach(async () => {
    notificationMock.warning.mockReset();
    notificationMock.showDefault.mockReset();

    await TestBed.configureTestingModule({
      imports: [ChangePasswordModalComponent],
      providers: [{ provide: NotificationService, useValue: notificationMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordModalComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should validate required fields', () => {
    component.onConfirm();

    expect(component.error).toBe('Preencha todos os campos');
  });

  it('should validate password confirmation', () => {
    component.currentPassword = 'Current123!';
    component.newPassword = 'NewPassword1!';
    component.confirmPassword = 'DifferentPassword1!';

    component.onConfirm();

    expect(component.error).toBe('As senhas digitadas não são iguais');
  });

  it('should emit confirm when new password is valid', () => {
    const confirmSpy = vi.spyOn(component.confirm, 'emit');

    component.currentPassword = 'Current123!';
    component.newPassword = 'StrongPassword1!';
    component.confirmPassword = 'StrongPassword1!';

    component.onConfirm();

    expect(confirmSpy).toHaveBeenCalledWith({ 
      currentPassword: 'Current123!', 
      newPassword: 'StrongPassword1!' 
    });
    expect(component.newPassword).toBe('');
    expect(component.confirmPassword).toBe('');
  });

  it('should toggle password visibility', () => {
    expect(component.showCurrentPassword).toBe(false);
    
    component.toggleShowPassword('current');
    expect(component.showCurrentPassword).toBe(true);
    
    component.toggleShowPassword('current');
    expect(component.showCurrentPassword).toBe(false);
  });

  it('should clear fields when closing modal', () => {
    component.currentPassword = 'test';
    component.newPassword = 'test';
    component.error = 'test error';

    component.onClose();

    expect(component.currentPassword).toBe('');
    expect(component.newPassword).toBe('');
    expect(component.error).toBe('');
  });
});