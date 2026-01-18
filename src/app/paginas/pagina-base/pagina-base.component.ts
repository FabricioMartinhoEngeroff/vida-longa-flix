import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { CabecalhoComponent } from '../../components/cabecalho/cabecalho.component';
import { BarraNavegacaoComponent } from '../../components/barra-navegacao/barra-navegacao.component';
import { RodapeComponent } from '../../components/rodape/rodape.component';
import { ModalVideoZoomComponent } from '../../paginas/modal-video-zoom/modal-video-zoom.component';
@Component({
  selector: 'app-pagina-base',
  standalone: true,
  imports: [
    RouterOutlet,
    CabecalhoComponent,
    BarraNavegacaoComponent,
    RodapeComponent,
    ModalVideoZoomComponent,
  ],
  templateUrl: './pagina-base.component.html',
  styleUrls: ['./pagina-base.component.css'],
})
export class PaginaBaseComponent {}
