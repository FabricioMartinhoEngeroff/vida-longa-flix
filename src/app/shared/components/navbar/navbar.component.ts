import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavItemComponent } from '../nav-item/nav-item.component';
import { UserAuthenticationService } from '../../../auth/services/user-authentication.service';

interface MenuItem {
  name: string;
  icon: string;
  path: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NavItemComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {

  items: MenuItem[] = [
    { name: 'Início', icon: 'home', path: '/app' },
    { name: 'Cardápios', icon: 'menu_book', path: '/app/menus' },
    { name: 'Favoritos', icon: 'favorite_border', path: '/app/favorites' },
    { name: 'Histórico', icon: 'history', path: '/app/history' },
    { name: 'Mais vistos', icon: 'visibility', path: '/app/most-viewed' },
    { name: 'Reels', icon: 'play_circle', path: '/app' },
    { name: 'Adicionar vídeos', icon: 'video_call', path: '/app/video-admin', adminOnly: true },
    { name: 'Admin Cardápios', icon: 'menu_book', path: '/app/menu-admin', adminOnly: true },
  ];

  isAdmin = false;
  visibleItems: MenuItem[] = [];
  active: string = this.items[0].name;
  
  constructor(
    private router: Router, 
    private auth: UserAuthenticationService
  ) {
   
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.updateActiveFromRoute());

    this.updateActiveFromRoute();

    const user = this.auth.user;
    this.isAdmin = !!user && user.email === 'fa.engeroff@gmail.com';
    this.visibleItems = this.items.filter(i => !i.adminOnly || this.isAdmin);
  }

  private updateActiveFromRoute() {
    const url = this.router.url;
    const activeItem = this.items.find((i) => i.path === url);
    if (activeItem) this.active = activeItem.name;
  }

  clickItem(item: MenuItem) {
    this.router.navigate([item.path]);
  }
}