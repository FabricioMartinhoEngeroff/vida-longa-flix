import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { UserMenuComponent } from './user-menu.component';
import { UserAuthenticationService } from '../../../auth/services/user-authentication.service';
import { NotificationService } from '../../services/alert-message/alert-message.service';

describe('UserMenuComponent', () => {
  let component: UserMenuComponent;
  let fixture: ComponentFixture<UserMenuComponent>;
  
  const routerMock = { navigate: vi.fn() };
  const authMock = { logout: vi.fn() };
  const notificationMock = { showDefault: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMenuComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: UserAuthenticationService, useValue: authMock },
        { provide: NotificationService, useValue: notificationMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle menu when clicking button', () => {
    expect(component.isMenuOpen).toBe(false);
    
    component.toggleMenu();
    expect(component.isMenuOpen).toBe(true);
    
    component.toggleMenu();
    expect(component.isMenuOpen).toBe(false);
  });

  it('should open logout modal when logout is clicked', () => {
    component.logout();
    
    expect(component.isLogoutModalOpen).toBe(true);
    expect(component.isMenuOpen).toBe(false);
  });

  it('should call authService.logout when confirming logout', () => {
    component.confirmLogout();
    
    expect(authMock.logout).toHaveBeenCalled();
  });

  it('should reject invalid file types', () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    
    component.processPhoto(file);
    
    expect(notificationMock.showDefault).toHaveBeenCalled();
  });

  it('should reject files larger than 2MB', () => {
    const largeFile = new File([new ArrayBuffer(3 * 1024 * 1024)], 'large.jpg', { 
      type: 'image/jpeg' 
    });
    
    component.processPhoto(largeFile);
    
    expect(notificationMock.showDefault).toHaveBeenCalled();
  });
});