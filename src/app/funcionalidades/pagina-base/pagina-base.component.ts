import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { CabecalhoComponent } from '../../compartilhado/componentes/cabecalho/cabecalho.component';
import { BarraNavegacaoComponent } from '../../compartilhado/componentes/barra-navegacao/barra-navegacao.component';
import { RodapeComponent } from '../../compartilhado/componentes/rodape/rodape.component';
import { ModalVideoZoomComponent } from '../modal-video-zoom/modal-video-zoom.component';

@Component({
  selector: 'app-pagina-base',
  standalone: true,
  imports: [
    RouterOutlet,
    CabecalhoComponent,
    BarraNavegacaoComponent,
    RodapeComponent,
    ModalVideoZoomComponent
  ],
  templateUrl: './pagina-base.component.html',
  styleUrls: ['./pagina-base.component.css'],
})
export class PaginaBaseComponent {}