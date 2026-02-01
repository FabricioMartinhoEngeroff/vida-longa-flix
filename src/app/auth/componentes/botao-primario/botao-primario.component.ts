import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-botao-primario',
  standalone: true,
  templateUrl: './botao-primario.component.html',
  styleUrls: ['./botao-primario.component.css'],
})
export class BotaoPrimarioComponent {
  @Input() texto: string = 'Entrar'; 
  @Input() disabled: boolean = false;
  @Input() type: 'button' | 'submit' = 'submit';
}