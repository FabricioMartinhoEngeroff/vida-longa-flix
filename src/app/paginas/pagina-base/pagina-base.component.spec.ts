import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { CabecalhoComponent } from '../../components/cabecalho/cabecalho.component';
import { RodapeComponent } from '../../components/rodape/rodape.component';
import { BarraNavegacaoComponent } from '../../components/barra-navegacao/barra-navegacao.component';

@Component({
  selector: 'app-pagina-base',
  standalone: true,
  imports: [RouterOutlet, CabecalhoComponent, RodapeComponent, BarraNavegacaoComponent],
  templateUrl: './pagina-base.component.html',
  styleUrls: ['./pagina-base.component.css'],
})
export class PaginaBaseComponent {}
