import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { ChangePasswordModalComponent } from '../change-password-modal/change-password-modal.component';
import { UserAuthenticationService } from '../../../auth/services/user-authentication.service';
import { UserProfileModalComponent } from '../user-profile-modal/user-profile-modal.component';
import { DEFAULT_MESSAGES } from '../../services/alert-message/default-messages.constants';
import { NotificationService } from '../../services/alert-message/alert-message.service';

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
  isMenuOpen = false;
  isLogoutModalOpen = false;
  isDraggingPhoto = false;
  isChangePasswordModalOpen = false;
  isProfileModalOpen = false;

  user = {
    name: 'Fabricio Engeroff',
    email: 'fa.engeroff@gmail.com',
    photo: null as string | null,
  };

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private authService: UserAuthenticationService
  ) {}

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
    // TODO: salvar perfil
    // TODO: Enviar para backend
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

  confirmPasswordChange(data: { currentPassword: string; newPassword: string }): void {
    // TODO: mudar senha

    this.isChangePasswordModalOpen = false;
    this.closeMenu();
    this.notificationService.showDefault(DEFAULT_MESSAGES.PASSWORD_CHANGED);
  }
}