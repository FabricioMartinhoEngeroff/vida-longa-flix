import { Component, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { ChangePasswordModalComponent } from '../change-password-modal/change-password-modal.component';
import { AuthService } from '../../../auth/services/auth.service';
import { UserProfileModalComponent } from '../user-profile-modal/user-profile-modal.component';
import { DEFAULT_MESSAGES } from '../../services/alert-message/default-messages.constants';
import { NotificationService } from '../../services/alert-message/alert-message.service';
import type { ProfileData, User } from '../../../auth/types/user.types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [
    MatIconModule,
    ConfirmationModalComponent,
    ChangePasswordModalComponent,
    UserProfileModalComponent,
  ],
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.css'],
})
export class UserMenuComponent {
  private readonly destroyRef = inject(DestroyRef);
  isMenuOpen = false;
  isLogoutModalOpen = false;
  isDraggingPhoto = false;
  isChangePasswordModalOpen = false;
  isProfileModalOpen = false;

  user: {
    name: string;
    email: string;
    photo: string | null;
    taxId?: string;
    phone?: string;
    address?: User['address'];
  } = {
    name: '',
    email: '',
    photo: null,
    taxId: '',
    phone: '',
    address: undefined,
  };

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
    const current = this.authService.user;
    if (current) {
      this.user = {
        name: current.name,
        email: current.email,
        photo: current.photo ?? null,
        taxId: current.taxId ?? '',
        phone: current.phone ?? '',
        address: current.address,
      };
    }

    this.authService.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((u) => {
        if (!u) return;
        this.user = {
          name: u.name,
          email: u.email,
          photo: u.photo ?? null,
          taxId: u.taxId ?? '',
          phone: u.phone ?? '',
          address: u.address,
        };
      });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

 
  selectPhoto(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        this.processPhoto(file);
      }
    };
    input.click();
  }

 
  processPhoto(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.notificationService.showDefault(DEFAULT_MESSAGES.INVALID_FILE_FORMAT);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.notificationService.showDefault(DEFAULT_MESSAGES.FILE_TOO_LARGE);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.user.photo = e.target.result;
      this.authService.updatePhoto(this.user.photo).catch(() => {
        this.notificationService.showDefault(DEFAULT_MESSAGES.GENERIC_ERROR);
      });
      this.notificationService.showDefault(DEFAULT_MESSAGES.PHOTO_UPDATED);
    };
    reader.readAsDataURL(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingPhoto = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingPhoto = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingPhoto = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processPhoto(files[0]);
    }
  }

  goToProfile(): void {
    this.isProfileModalOpen = true;
    this.closeMenu();
  }

  closeProfileModal(): void {
    this.isProfileModalOpen = false;
  }

  saveProfile(data: any): void {
    const payload: ProfileData = data;
    this.authService.updateProfile(payload).catch(() => {
      this.notificationService.showDefault(DEFAULT_MESSAGES.GENERIC_ERROR);
    });
    this.isProfileModalOpen = false;
    this.notificationService.showDefault(DEFAULT_MESSAGES.PROFILE_UPDATED);
  }

  openChangePasswordFromProfile(): void {
    this.isProfileModalOpen = false;
    this.isChangePasswordModalOpen = true;
  }

  goToSettings(): void {
    // TODO: ir para configurações
    this.closeMenu();
  }

  logout(): void {
    this.isLogoutModalOpen = true;
    this.closeMenu();
  }

  confirmLogout(): void {
    this.authService.logout();
  }

  cancelLogout(): void {
    this.isLogoutModalOpen = false;
  }

  closePasswordModal(): void {
    this.isChangePasswordModalOpen = false;
  }

  confirmPasswordChange(_data: { currentPassword: string; newPassword: string }): void {
    // TODO: mudar senha

    this.isChangePasswordModalOpen = false;
    this.closeMenu();
    this.notificationService.showDefault(DEFAULT_MESSAGES.PASSWORD_CHANGED);
  }
}
