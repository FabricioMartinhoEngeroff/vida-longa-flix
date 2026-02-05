import { Routes } from '@angular/router';

import { PaginaBaseComponent } from './funcionalidades/pagina-base/pagina-base.component';
import { InicioComponent } from './funcionalidades/inicio/inicio.component';
import { FavoritosComponent } from './funcionalidades/favoritos/favoritos.component';
import { MaisVistosComponent } from './funcionalidades/mais-vistos/mais-vistos.component';
import { NaoEncontradaComponent } from './funcionalidades/nao-encontrada/nao-encontrada.component';

import { AutorizacaoComponent } from '../app/auth/paginas/autorizacao/autorizacao.component';
import { LoginComponent } from '../app/auth/paginas/login/login.component';
import { RegistrarComponent } from '../app/auth/paginas/registrar/registrar.component';
import { RedefinirSenhaComponent } from './auth/paginas/redefinir-senha/redefinir-senha.component';

export const routes: Routes = [

  { path: '', redirectTo: 'autorizacao', pathMatch: 'full' },

  { path: 'autorizacao', component: AutorizacaoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registrar', component: RegistrarComponent },
   { path: 'redefinir-senha', component: RedefinirSenhaComponent },

  {
    path: 'app',
    component: PaginaBaseComponent,
    children: [
      { path: '', component: InicioComponent }, // /app
      { path: 'favoritos', component: FavoritosComponent }, // /app/favoritos
      { path: 'mais-vistos', component: MaisVistosComponent }, // /app/mais-vistos
    ],
  },

  { path: '**', component: NaoEncontradaComponent },
];
