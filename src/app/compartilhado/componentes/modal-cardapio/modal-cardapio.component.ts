import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Cardapio } from '../../tipos/ cardapios';
import { ComentariosBoxComponent } from '../comentarios-box/comentarios-box.component';

@Component({
  selector: 'app-modal-cardapio',
  standalone: true,
  imports: [CommonModule, ComentariosBoxComponent],
  templateUrl: './modal-cardapio.component.html',
  styleUrls: ['./modal-cardapio.component.css'],
})
export class ModalCardapioComponent {
  @Input() cardapio: Cardapio | null = null;
  @Input() comentarios: string[] = [];

  @Output() fechar = new EventEmitter<void>();
  @Output() favoritar = new EventEmitter<void>();
  @Output() comentar = new EventEmitter<string>();
}
