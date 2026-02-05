import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { CabecalhoComponent } from '../../compartilhado/componentes/cabecalho/cabecalho.component';
import { RodapeComponent } from '../../compartilhado/componentes/rodape/rodape.component';
import { BarraNavegacaoComponent } from '../../compartilhado/componentes/barra-navegacao/barra-navegacao.component';

@Component({
  selector: 'app-pagina-base',
  standalone: true,
  imports: [RouterOutlet, CabecalhoComponent, RodapeComponent, BarraNavegacaoComponent],
  templateUrl: './pagina-base.component.html',
  styleUrls: ['./pagina-base.component.css'],
})
export class PaginaBaseComponent {}
