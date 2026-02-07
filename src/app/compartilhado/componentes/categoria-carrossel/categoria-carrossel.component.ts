import { Component, Input, TemplateRef } from '@angular/core';
import { NgFor, NgTemplateOutlet } from '@angular/common';

import { CarrosselComponent } from '../carrossel/carrossel.component';
import { TituloComponent } from '../titulo/titulo.component';

@Component({
  selector: 'app-categoria-carrossel',
  standalone: true,
  imports: [NgFor, NgTemplateOutlet, CarrosselComponent, TituloComponent],
  templateUrl: './categoria-carrossel.component.html',
  styleUrls: ['./categoria-carrossel.component.css'],
})
export class CategoriaCarrosselComponent<T = any> {
  @Input() titulo = '';
  @Input() itens: T[] = [];
  @Input() itemTemplate!: TemplateRef<{ $implicit: T }>;
}
