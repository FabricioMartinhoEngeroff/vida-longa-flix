import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { ItemNavegacaoComponent } from '../item-navegacao/item-navegacao.component';

type ItemMenu = {
  nome: string;
  icone: string;
  path: string;
};

@Component({
  selector: 'app-barra-navegacao',
  standalone: true,
  imports: [NgFor, ItemNavegacaoComponent],
  templateUrl: './barra-navegacao.component.html',
  styleUrls: ['./barra-navegacao.component.css'],
})
export class BarraNavegacaoComponent {
itens: ItemMenu[] = [
  { nome: 'Início', icone: 'assets/icones/home-ativo.png', path: '/' },
  { nome: 'Mais vistas', icone: 'assets/icones/mais-vistas-ativo.png', path: '/mais-vistas' },
  { nome: 'Favoritos', icone: 'assets/icones/mais-curtidas-ativo.png', path: '/favoritos' },
  { nome: 'Reels', icone: 'assets/icones/novas-ativo.png', path: '/novas' },
  { nome: 'Surpreenda', icone: 'assets/icones/surpreenda-me-ativo.png', path: '/surpreenda' },
];

  ativo: string = this.itens[0].nome;

  constructor(private router: Router) {}

  clicarItem(item: ItemMenu) {
    this.ativo = item.nome;
    this.router.navigate([item.path]);
  }
}