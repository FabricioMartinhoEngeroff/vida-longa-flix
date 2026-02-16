import { Routes } from '@angular/router';

import { AuthorizationComponent } from './auth/pages/authorization/authorization.component';
import { LoginComponent } from './auth/pages/login/login.component';
import { RegisterComponent } from './auth/pages/register/register.component';
import { PasswordChangeComponent } from './auth/pages/password-change/password-change.component';

import { PaginaBaseComponent } from './funcionalidades/pagina-base/pagina-base.component';
import { InicioComponent } from './funcionalidades/inicio/inicio.component';
import { FavoritosComponent } from './funcionalidades/favoritos/favoritos.component';
import { MaisVistosComponent } from './funcionalidades/mais-vistos/mais-vistos.component';
import { AdminVideosComponent } from './funcionalidades/administrador-videos/administrador-videos.component';
import { CardapiosComponent } from './funcionalidades/cardapios/cardapios.component';
import { AdministradorCardapiosComponent } from './funcionalidades/administrador-cardapios/administrador-cardapios.component';
import { NaoEncontradaComponent } from './funcionalidades/nao-encontrada/nao-encontrada.component';

export const routes: Routes = [
  { path: '', redirectTo: 'authorization', pathMatch: 'full' },

  // English routes
  { path: 'authorization', component: AuthorizationComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'password-change', component: PasswordChangeComponent },

  // Legacy aliases (PT-BR) to keep old links working
  { path: 'autorizacao', component: AuthorizationComponent },
  { path: 'registrar', component: RegisterComponent },
  { path: 'redefinir-senha', component: PasswordChangeComponent },

  {
    path: 'app',
    component: PaginaBaseComponent,
    children: [
      { path: '', component: InicioComponent },
      { path: 'favoritos', component: FavoritosComponent },
      { path: 'mais-vistos', component: MaisVistosComponent },
      { path: 'historico', component: InicioComponent },
      { path: 'admin-videos', component: AdminVideosComponent },
      { path: 'cardapios', component: CardapiosComponent },
      { path: 'admin-cardapios', component: AdministradorCardapiosComponent },
    ],
  },

  { path: '**', component: NaoEncontradaComponent },
];
