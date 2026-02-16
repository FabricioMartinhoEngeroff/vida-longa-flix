import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { CabecalhoComponent } from '../../shared/components/header/header.component';
import { BarraNavegacaoComponent } from '../../shared/components/navbar/navbar.component';
import { RodapeComponent } from '../../shared/components/footer/footer.component';
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