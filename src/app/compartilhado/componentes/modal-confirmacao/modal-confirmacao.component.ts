import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button'; 

@Component({
  selector: 'app-modal-confirmacao',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule ],
  templateUrl: './modal-confirmacao.component.html',
  styleUrls: ['./modal-confirmacao.component.css']
})
export class ModalConfirmacaoComponent {
  @Input() aberta = false;
  @Input() titulo = 'Atenção';
  @Input() mensagem = 'Deseja continuar?';
  @Input() textoBotaoConfirmar = 'Confirmar';
  @Input() textoBotaoCancelar = 'Cancelar';
  @Input() tipoPerigo = false; // true = botão vermelho

  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  onConfirmar() {
    this.confirmar.emit();
  }

  onCancelar() {
    this.cancelar.emit();
  }
}