import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BotaoFavoritarComponent } from '../botao-favoritar/botao-favoritar.component';

@Component({
  selector: 'app-comentarios-box',
  standalone: true,
  imports: [NgFor, FormsModule, BotaoFavoritarComponent],
  templateUrl: './comentarios-box.component.html',
  styleUrls: ['./comentarios-box.component.css'],
})
export class ComentariosBoxComponent {
  @Input() comentarios: string[] = [];
  @Input() favorito = false;

  @Output() favoritar = new EventEmitter<void>();
  @Output() comentar = new EventEmitter<string>();

  novoComentario = '';

  enviar() {
    const texto = this.novoComentario.trim();
    if (!texto) return;
    this.comentar.emit(texto);
    this.novoComentario = '';
  }
}
