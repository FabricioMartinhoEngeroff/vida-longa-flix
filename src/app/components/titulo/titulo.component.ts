import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlinhamentoTitulo = 'left' | 'center' | 'right';

@Component({
  selector: 'app-titulo',
  templateUrl: './titulo.component.html',
  styleUrls: ['./titulo.component.css'],
  standalone: true,
  imports: [CommonModule], // 
})
export class TituloComponent {
  @Input() alinhamento: AlinhamentoTitulo = 'left';
}
