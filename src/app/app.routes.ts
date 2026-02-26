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
import { authGuard } from './auth/services/auth.guard';
import { adminGuard } from './auth/services/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'authorization', pathMatch: 'full' },

  { path: 'authorization', component: AuthorizationComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'password-change', component: PasswordChangeComponent },

  { path: 'autorizacao', component: AuthorizationComponent },
  { path: 'registrar', component: RegisterComponent },
  { path: 'redefinir-senha', component: PasswordChangeComponent },

  {
    path: 'app',
    component: BasePageComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: HomeComponent },

      { path: 'favorites', component: FavoritesComponent },
      { path: 'favoritos', component: FavoritesComponent },
      { path: 'most-viewed', component: MostViewedComponent },
      { path: 'mais-vistos', component: MostViewedComponent },
      { path: 'history', component: HomeComponent },
      { path: 'historico', component: HomeComponent },
      { path: 'menus', component: MenusComponent },
      { path: 'cardapios', component: MenusComponent },

      { path: 'video-admin', component: VideoAdminComponent, canActivate: [adminGuard] },
      { path: 'menu-admin', component: MenuAdminComponent, canActivate: [adminGuard] },
    ],
  },

  { path: '**', component: NotFoundComponent },
];