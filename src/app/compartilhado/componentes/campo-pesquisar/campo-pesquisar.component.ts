import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-campo-pesquisar',
  templateUrl: './campo-pesquisar.component.html',
  styleUrls: ['./campo-pesquisar.component.css'],
  standalone: true,
  imports: [CommonModule, MatIconModule],
})
export class CampoPesquisarComponent {
  @Input() placeholder = 'Pesquisar...';
  @Input() value = '';
  @Input() disabled = false;

  @Input() categorias: string[] = [];
  @Input() sugestoes: string[] = [];

  @Output() valueChange = new EventEmitter<string>();
  @Output() buscar = new EventEmitter<string>();
  

  @ViewChild('inputEl') inputEl?: ElementRef<HTMLInputElement>;
  aberto = false;

  abrir() {
    if (this.disabled) return;
    this.aberto = true;
    setTimeout(() => this.inputEl?.nativeElement.focus(), 0);
  }

  fechar() {
    this.aberto = false;
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.valueChange.emit(this.value);
  }

escolher(texto: string) {
  this.value = texto;
  this.valueChange.emit(texto);
  this.buscar.emit(texto);
  this.aberto = false;
}

  confirmarBusca() {
  const termo = (this.value || '').trim();
  if (termo) this.buscar.emit(termo);
  this.aberto = false;
}
}
