import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { vi } from 'vitest';
import { UserProfileModalComponent } from './user-profile-modal.component';
import { NotificationService } from '../../services/alert-message/alert-message.service';

describe('UserProfileModalComponent', () => {
  let component: UserProfileModalComponent;
  let fixture: ComponentFixture<UserProfileModalComponent>;
  
  const notificationMock = { showDefault: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileModalComponent],
      providers: [
        FormBuilder,
        { provide: NotificationService, useValue: notificationMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileModalComponent);
    component = fixture.componentInstance;
    
    component.user = {
      name: 'Test User',
      email: 'test@email.com',
      taxId: '12345678900',
      phone: '11987654321',
      address: {
        street: 'Test Street',
        number: '123',
        neighborhood: 'Test Neighborhood',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345678'
      }
    };
    
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with user data', () => {
    component.ngOnInit();
    
    expect(component.form.get('name')?.value).toBe('Test User');
    expect(component.form.get('email')?.value).toBe('test@email.com');
    expect(component.form.get('taxId')?.value).toBe('12345678900');
  });

  it('should emit close when onClose is called', () => {
    const emitSpy = vi.spyOn(component.close, 'emit');
    
    component.onClose();
    
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit save with form data when form is valid', () => {
    component.ngOnInit();
    const emitSpy = vi.spyOn(component.save, 'emit');
    
    component.form.patchValue({
      name: 'Updated Name',
      email: 'updated@email.com'
    });
    
    component.onSave();
    
    const emittedData = emitSpy.mock.calls[0][0];
    expect(emittedData.name).toBe('Updated Name');
    expect(emittedData.email).toBe('updated@email.com');
  });

  it('should show error notification when form is invalid', () => {
    component.ngOnInit();
    
    component.form.patchValue({
      name: '',
      email: 'invalid-email'
    });
    
    component.onSave();
    
    expect(notificationMock.showDefault).toHaveBeenCalled();
  });

  it('should emit openChangePassword when onOpenChangePassword is called', () => {
    const emitSpy = vi.spyOn(component.openChangePassword, 'emit');
    
    component.onOpenChangePassword();
    
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should return error message for required fields', () => {
    component.ngOnInit();
    
    const nameControl = component.form.get('name');
    nameControl?.setValue('');
    nameControl?.markAsTouched();
    
    expect(component.fieldError('name')).toBe('Campo obrigatório');
  });

  it('should return error message for invalid email', () => {
    component.ngOnInit();
    
    const emailControl = component.form.get('email');
    emailControl?.setValue('invalid-email');
    emailControl?.markAsTouched();
    
    expect(component.fieldError('email')).toBe('E-mail inválido');
  });

  it('should return null when field has no errors', () => {
    component.ngOnInit();
    
    const nameControl = component.form.get('name');
    nameControl?.setValue('Valid Name');
    nameControl?.markAsTouched();
    
    expect(component.fieldError('name')).toBeNull();
  });
});