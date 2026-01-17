import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CabecalhoComponent } from './components/cabecalho/cabecalho.component';
import { RodapeComponent } from './components/rodape/rodape.component';
import { BarraNavegacaoComponent } from './components/barra-navegacao/barra-navegacao.component';
import { ItemNavegacaoComponent } from './components/item-navegacao/item-navegacao.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: true,
  imports: [
    RouterOutlet,     
    CabecalhoComponent,
    RodapeComponent,
    BarraNavegacaoComponent,
    ItemNavegacaoComponent
  ],
})
export class App {}
