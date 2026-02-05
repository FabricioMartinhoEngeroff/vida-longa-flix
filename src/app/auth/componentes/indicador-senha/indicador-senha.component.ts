import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { calcularForcaSenha, ResultadoForcaSenha } from '../../utils/validador-senha-forte';

@Component({
  selector: 'app-indicador-senha',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indicador-senha.component.html',
  styleUrl: './indicador-senha.component.css'
})
export class IndicadorSenhaComponent implements OnChanges {
  @Input() senha = '';
  @Input() mostrarRequisitos = true;

  resultado: ResultadoForcaSenha = calcularForcaSenha('');

  ngOnChanges() {
    this.resultado = calcularForcaSenha(this.senha);
  }
}