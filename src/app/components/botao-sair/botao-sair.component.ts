import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ModalConfirmacaoComponent } from '../modal-confirmacao/modal-confirmacao.component';
import { UsuarioAutenticacaoService } from '../../auth/api/usuario-autenticacao.service';  
@Component({
  selector: 'app-botao-sair',
  standalone: true,
  imports: [CommonModule, MatIconModule, ModalConfirmacaoComponent],
  template: `
    <button 
      class="btn-sair" 
      (click)="modalAberta = true"
      title="Sair"
    >
      <mat-icon>logout</mat-icon>
    </button>

    <app-modal-confirmacao
      [aberta]="modalAberta"
      titulo="Atenção"
      mensagem="Deseja realmente sair do sistema?"
      textoBotaoConfirmar="Sair"
      textoBotaoCancelar="Cancelar"
      [tipoPerigo]="true"
      (confirmar)="confirmarSaida()"
      (cancelar)="cancelarSaida()"
    ></app-modal-confirmacao>
  `,
  styles: [`
    .btn-sair {
      width: 40px;
      height: 40px;
      
      display: flex;
      align-items: center;
      justify-content: center;
      
      border: none;
      border-radius: 50%;
      background: transparent;
      
      color: #6a0dad;
      cursor: pointer;
      
      transition: all 0.2s ease;
    }
    
    .btn-sair:hover {
      background: rgba(106, 13, 173, 0.1);
      transform: scale(1.05);
    }
    
    .btn-sair mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    @media (max-width: 768px) {
    .btn-sair {
      width: 36px;
      height: 36px;
    }
    
    .btn-sair mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
  }
  `]
})
export class BotaoSairComponent {
  modalAberta = false;

  constructor(private usuarioAuth: UsuarioAutenticacaoService) {}  // ← SERVICE EXISTENTE

  confirmarSaida() {
    this.usuarioAuth.sair();  // ← USA O MÉTODO QUE JÁ EXISTE
  }

  cancelarSaida() {
    this.modalAberta = false;
  }
}