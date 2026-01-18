import { Routes } from '@angular/router';

import { PaginaBaseComponent } from './paginas/pagina-base/pagina-base.component';
import { InicioComponent } from './paginas/inicio/inicio.component';
import { FavoritosComponent } from './paginas/favoritos/favoritos.component';
import { NaoEncontradaComponent } from './paginas/nao-encontrada/nao-encontrada.component';

export const routes: Routes = [
  {
    path: '',
    component: PaginaBaseComponent,
    children: [
      { path: '', component: InicioComponent },
      { path: 'favoritos', component: FavoritosComponent },
    ],
  },

  { path: '**', component: NaoEncontradaComponent },
];
