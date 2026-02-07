import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, Observable } from 'rxjs';

import { CardapioService } from '../../compartilhado/servicos/cardapio/cardapio-service';
import { Cardapio } from '../../compartilhado/tipos/ cardapios';
import { ComentariosService } from '../../compartilhado/servicos/comentarios/comentarios.service';
import { ModalCardapioComponent } from '../../compartilhado/componentes/modal-cardapio/modal-cardapio.component';
import { CategoriaCarrosselComponent } from '../../compartilhado/componentes/categoria-carrossel/categoria-carrossel.component';
import { agruparPor, Grupo } from '../../compartilhado/utils/agrupar-por';

type GrupoCardapio = Grupo<Cardapio>;

@Component({
  selector: 'app-cardapios',
  standalone: true,
  imports: [CommonModule, CategoriaCarrosselComponent, ModalCardapioComponent],
  templateUrl: './cardapios.component.html',
  styleUrls: ['./cardapios.component.css'],
})
export class CardapiosComponent {
  cardapiosPorCategoria$: Observable<GrupoCardapio[]>;
  selecionado: Cardapio | null = null;

  comentariosState: Record<string, string[]> = {};

  constructor(
    private cardapioService: CardapioService,
    private comentariosService: ComentariosService
  ) {
    this.cardapiosPorCategoria$ = this.cardapioService.cardapios$.pipe(
      map(list => agruparPor(list, c => c.category?.name || 'Sem categoria'))
    );

    this.comentariosService.comentarios$.subscribe(map => {
      this.comentariosState = map;
    });
  }

  adicionarComentario(id: string, texto: string) {
    this.comentariosService.add(id, texto);
  }

  abrir(cardapio: Cardapio) {
    this.selecionado = cardapio;
  }

  fechar() {
    this.selecionado = null;
  }

 toggleFavorite(id: string) {
  this.cardapioService.toggleFavorite(id);

  const atualizado = this.cardapioService.cardapios.find(c => c.id === id);
  if (atualizado) this.selecionado = atualizado;
}

}
