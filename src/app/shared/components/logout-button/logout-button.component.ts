import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UserAuthenticationService } from '../../../auth/services/user-authentication.service';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';


@Component({
  selector: 'app-logout-button',
  standalone: true,
  imports: [CommonModule, MatIconModule, ConfirmationModalComponent],
  template: `
    <button
      class="btn-logout"
      (click)="isModalOpen = true"
      title="Sair"
    >
      <mat-icon>logout</mat-icon>
    </button>

    <app-modal-confirmacao
      [aberta]="isModalOpen"
      titulo="Atenção"
      mensagem="Deseja realmente sair do sistema?"
      textoBotaoConfirmar="Sair"
      textoBotaoCancelar="Cancelar"
      [tipoPerigo]="true"
      (confirmar)="confirmLogout()"
      (cancelar)="cancelLogout()"
    ></app-modal-confirmacao>
  `,
  styles: [`
    .btn-logout {
      width: 36px;
      height: 36px;

      display: flex;
      align-items: center;
      justify-content: center;

      border: none;
      border-radius: 50%;
      background: transparent;

      color: #2f6b3a;
      cursor: pointer;

      transition: all 0.2s ease;
    }

    .btn-logout:hover {
      background: rgba(47, 107, 58, 0.1);
      transform: scale(1.05);
    }

    .btn-logout mat-icon {
      font-size: 25px;
      width: 25px;
      height: 25px;
    }

    @media (max-width: 768px) {
      .btn-logout mat-icon {
        font-size: 25px;
        width: 25px;
        height: 25px;
      }
    }
  `],
})
export class LogoutButtonComponent {
  isModalOpen = false;

  constructor(private authService: UserAuthenticationService) {}

  confirmLogout(): void {
    this.authService.logout();
  }

  cancelLogout(): void {
    this.isModalOpen = false;
  }
}
