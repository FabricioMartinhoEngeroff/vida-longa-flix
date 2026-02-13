import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, Observable } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';

import { CardapioService } from '../../compartilhado/servicos/cardapio/cardapio-service';
import { Cardapio } from '../../compartilhado/tipos/ cardapios';
import { ComentariosService } from '../../compartilhado/servicos/comentarios/comentarios.service';
import { ModalCardapioComponent } from '../../compartilhado/componentes/modal-cardapio/modal-cardapio.component';
import { CategoriaCarrosselComponent } from '../../compartilhado/componentes/categoria-carrossel/categoria-carrossel.component';
import { EngajamentoResumoComponent } from '../../compartilhado/componentes/engajamento-resumo/engajamento-resumo.component';
import { agruparPor, Grupo } from '../../compartilhado/utils/agrupar-por';

type GrupoCardapio = Grupo<Cardapio>;

@Component({
  selector: 'app-cardapios',
  standalone: true,
  imports: [
    CommonModule,
    CategoriaCarrosselComponent,
    ModalCardapioComponent,
    EngajamentoResumoComponent,
  ],
  templateUrl: './cardapios.component.html',
  styleUrls: ['./cardapios.component.css'],
})
export class CardapiosComponent implements OnInit {

  cardapiosPorCategoria$: Observable<GrupoCardapio[]>;
  selecionado: Cardapio | null = null;

  comentariosState: Record<string, string[]> = {};

  private cardapiosLista: Cardapio[] = [];
  private tipoBusca = '';
  private idBusca = '';
  private categoriaBusca = '';
  private termoBusca = '';

  private modalCardapioNoHistorico = false;

  constructor(
    private cardapioService: CardapioService,
    private comentariosService: ComentariosService,
    private route: ActivatedRoute
  ) {
    this.cardapiosPorCategoria$ = this.cardapioService.cardapios$.pipe(
      map((list) =>
        agruparPor(list, (c) => c.category?.name || 'Sem categoria')
      )
    );

    this.comentariosService.comentarios$.subscribe((mapa) => {
      this.comentariosState = mapa;
    });
  }

    ngOnInit(): void {
    this.cardapioService.cardapios$.subscribe((list) => {
      this.cardapiosLista = list;
      this.sincronizarSelecionado();
      this.tentarScrollBusca();
    });

    this.route.queryParams.subscribe((params: Params) => {
      this.tipoBusca = (params['tipo'] || '').toLowerCase();
      this.idBusca = (params['id'] || '').toString();
      this.categoriaBusca = (params['cat'] || '').toString();
      this.termoBusca = (params['q'] || '').toString();
      this.tentarScrollBusca();
    });
  }

  adicionarComentario(id: string, texto: string) {
    this.comentariosService.add('cardapio', id, texto);
  }

  totalComentarios(id: string): number {
    return this.comentariosState[`cardapio:${id}`]?.length ?? 0;
  }

  comentariosDoCardapio(id: string): string[] {
    return this.comentariosState[`cardapio:${id}`] ?? [];
  }

  abrir(cardapio: Cardapio) {
  if (!this.selecionado && typeof window !== 'undefined') {
    window.history.pushState({ modal: 'cardapio' }, '');
    this.modalCardapioNoHistorico = true;
  }
  this.selecionado = cardapio;
}

fechar() {
  if (!this.selecionado) return;

  this.selecionado = null;

  if (this.modalCardapioNoHistorico && typeof window !== 'undefined') {
    this.modalCardapioNoHistorico = false;
    window.history.back();
  }
}

@HostListener('window:popstate')
onPopState(): void {
  if (!this.selecionado) return;
  this.selecionado = null;
  this.modalCardapioNoHistorico = false;
}

  toggleFavorite(id: string) {
    this.cardapioService.toggleFavorite(id);
    this.sincronizarSelecionado();
  }

  private sincronizarSelecionado(): void {
    if (!this.selecionado) return;
    this.selecionado =
      this.cardapiosLista.find((c) => c.id === this.selecionado?.id) ?? null;
  }

    private tentarScrollBusca() {
    if (!this.cardapiosLista.length) return;

    if (this.tipoBusca === 'cardapio' && this.idBusca) {
      this.scrollParaElemento(`cardapio-${this.idBusca}`);
      return;
    }

    if (this.tipoBusca === 'categoria-cardapio' && this.categoriaBusca) {
      this.scrollParaElemento(this.criarIdCategoria(this.categoriaBusca));
      return;
    }

    if (!this.termoBusca) return;

    const termoN = this.normalizar(this.termoBusca);
    const alvo = [...this.cardapiosLista]
      .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }))
      .find((c) =>
        this.normalizar(c.title).includes(termoN) ||
        this.normalizar(c.description).includes(termoN) ||
        this.normalizar(c.category?.name || '').includes(termoN)
      );

    if (alvo) {
      this.scrollParaElemento(`cardapio-${alvo.id}`);
    }
  }

  private scrollParaElemento(id: string) {
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  }

  private criarIdCategoria(nome: string): string {
    return 'cat-' + nome.toLowerCase().trim().replace(/\s+/g, '-');
  }

  private normalizar(texto: string): string {
    return (texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

}
