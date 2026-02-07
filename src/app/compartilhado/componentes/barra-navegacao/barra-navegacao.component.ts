import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ItemNavegacaoComponent } from '../item-navegacao/item-navegacao.component';
import { UsuarioAutenticacaoService } from '../../../auth/servicos/usuario-autenticacao.service';


interface ItemMenu {
  nome: string;
  icone: string;
  path: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-barra-navegacao',
  standalone: true,
  imports: [NgFor, ItemNavegacaoComponent],
  templateUrl: './barra-navegacao.component.html',
  styleUrls: ['./barra-navegacao.component.css'],
})
export class BarraNavegacaoComponent {
 itens: ItemMenu[] = [
  { nome: 'Início', icone: 'home', path: '/app' },
  { nome: 'Cardápios', icone: 'menu_book', path: '/app/cardapios' },
  { nome: 'Favoritos', icone: 'favorite_border', path: '/app/favoritos' },
  { nome: 'Histórico', icone: 'history', path: '/app/historico' },
  { nome: 'Mais vistos', icone: 'visibility', path: '/app/mais-vistos' },
  { nome: 'Reels', icone: 'play_circle', path: '/app/reels' },
  { nome: 'Adicionar vídeos', icone: 'video_call', path: '/app/admin-videos', adminOnly: true },
  { nome: 'Admin Cardápios', icone: 'menu_book', path: '/app/admin-cardapios', adminOnly: true },

];

  isAdmin = false;
  itensVisiveis: ItemMenu[] = [];
  ativo: string = this.itens[0].nome;
  
 constructor(private router: Router, private auth: UsuarioAutenticacaoService) {
  this.router.events
    .pipe(filter((e) => e instanceof NavigationEnd))
    .subscribe(() => this.atualizarAtivoPorRota());

  this.atualizarAtivoPorRota();

  const user = this.auth.usuario;
  this.isAdmin = !!user && user.email === 'fa.engeroff@gmail.com';
  this.itensVisiveis = this.itens.filter(i => !i.adminOnly || this.isAdmin);
}


  private atualizarAtivoPorRota() {
    const url = this.router.url;
    const itemAtivo = this.itens.find((i) => i.path === url);
    if (itemAtivo) this.ativo = itemAtivo.nome;
  }

  clicarItem(item: ItemMenu) {
    this.router.navigate([item.path]);
  }
}
