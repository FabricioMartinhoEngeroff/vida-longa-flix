import { Routes } from '@angular/router';

import { AuthorizationComponent } from './auth/pages/authorization/authorization.component';
import { LoginComponent } from './auth/pages/login/login.component';
import { RegisterComponent } from './auth/pages/register/register.component';
import { PasswordChangeComponent } from './auth/pages/password-change/password-change.component';

import { BasePageComponent } from './features/base-page/base-page.component';
import { HomeComponent } from './features/home/home.component';
import { FavoritesComponent } from './features/favorites/favorites.component';
import { MostViewedComponent } from './features/most-viewed/most-viewed.component';
import { VideoAdminComponent } from './features/video-admin/video-admin.component';
import { MenusComponent } from './features/menus/menus.component';
import { MenuAdminComponent } from './features/menu-admin/menu-admin.component';
import { NotFoundComponent } from './features/not-found/not-found.component';


export const routes: Routes = [
  { path: '', redirectTo: 'authorization', pathMatch: 'full' },

  { path: 'authorization', component: AuthorizationComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'password-change', component: PasswordChangeComponent },

  // Aliases PT-BR
  { path: 'autorizacao', component: AuthorizationComponent },
  { path: 'registrar', component: RegisterComponent },
  { path: 'redefinir-senha', component: PasswordChangeComponent },

  {
    path: 'app',
    component: BasePageComponent,
    children: [
      { path: '', component: HomeComponent },

      // Ingles
      { path: 'favorites', component: FavoritesComponent },
      { path: 'most-viewed', component: MostViewedComponent },
      { path: 'history', component: HomeComponent },
      { path: 'video-admin', component: VideoAdminComponent },
      { path: 'menus', component: MenusComponent },
      { path: 'menu-admin', component: MenuAdminComponent },

      // Aliases PT-BR (mantem compatibilidade)
      { path: 'favoritos', component: FavoritesComponent },
      { path: 'mais-vistos', component: MostViewedComponent },
      { path: 'historico', component: HomeComponent },
      { path: 'admin-videos', component: VideoAdminComponent },
      { path: 'cardapios', component: MenusComponent },
      { path: 'admin-cardapios', component: MenuAdminComponent },
    ],
  },

  { path: '**', component: NotFoundComponent },
];
