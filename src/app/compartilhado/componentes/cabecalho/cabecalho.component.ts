import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CampoPesquisarComponent } from '../campo-pesquisar/campo-pesquisar.component';
import { NotificacoesComponent } from '../notificações/notificacoes.component';
import { MenuUsuarioComponent } from '../menu-usuario/menu-usuario.component';
import { BotaoSairComponent } from '../botao-sair/botao-sair.component';
import { ViewportScroller } from '@angular/common';
import { CardapioService } from '../../servicos/cardapio/cardapio-service';
import { VideoService } from '../../servicos/video/video';


@Component({
  selector: 'app-cabecalho',
  templateUrl: './cabecalho.component.html',
  styleUrls: ['./cabecalho.component.css'],
  standalone: true,
  imports: [CampoPesquisarComponent, NotificacoesComponent, MenuUsuarioComponent, BotaoSairComponent ],
})

export class CabecalhoComponent implements OnInit {

  private router = inject(Router);
    categoriasBusca: string[] = [];
  sugestoesBusca: string[] = [];

  private videosIndex: Array<{ id: string; title: string; categoryName: string }> = [];
  private cardapiosIndex: Array<{ id: string; title: string; categoryName: string }> = [];

   constructor(
    private scroller: ViewportScroller,
    private videoService: VideoService,
    private cardapioService: CardapioService
  ) {}

  ngOnInit(): void {
    this.videoService.videosReels$.subscribe((videos) => {
      this.videosIndex = videos.map((v) => ({
        id: v.id,
        title: v.title,
        categoryName: v.category?.name || '',
      }));
    });

    this.cardapioService.cardapios$.subscribe((cardapios) => {
      this.cardapiosIndex = cardapios.map((c) => ({
        id: c.id,
        title: c.title,
        categoryName: c.category?.name || '',
      }));
    });
  }

  onPesquisar(valor: string) {
    const termo = (valor || '').trim();

    // Exibe sugestões após 3 caracteres úteis (ignora espaços).
    if (this.normalizar(termo).replace(/\s+/g, '').length < 3) {
      this.categoriasBusca = [];
      this.sugestoesBusca = [];
      return;
    }

    const tokens = this.tokenizar(termo);
    if (!tokens.length) {
      this.categoriasBusca = [];
      this.sugestoesBusca = [];
      return;
    }

    const titulos = [...new Set([
      ...this.videosIndex.map(v => v.title),
      ...this.cardapiosIndex.map(c => c.title),
    ])];

    const categorias = [...new Set([
      ...this.videosIndex.map(v => v.categoryName),
      ...this.cardapiosIndex.map(c => c.categoryName),
    ])].filter(Boolean);

    this.sugestoesBusca = this.ordenarPorRelevancia(titulos, tokens);
    this.categoriasBusca = this.ordenarPorRelevancia(categorias, tokens);
  }

  irParaCategoria(nome: string) {
    const id = 'cat-' + nome.toLowerCase().replace(/\s+/g, '-');
    this.scroller.scrollToAnchor(id);
  }

  irParaBusca(termoOriginal: string) {
    const termo = (termoOriginal || '').trim();
    if (!termo) return;

    const termoN = this.normalizar(termo);

    const videoExato = this.videosIndex.find(v => this.normalizar(v.title) === termoN);
    if (videoExato) {
      this.router.navigate(['/app'], { queryParams: { tipo: 'video', id: videoExato.id, q: termo } });
      return;
    }

    const cardapioExato = this.cardapiosIndex.find(c => this.normalizar(c.title) === termoN);
    if (cardapioExato) {
      this.router.navigate(['/app/cardapios'], { queryParams: { tipo: 'cardapio', id: cardapioExato.id, q: termo } });
      return;
    }

    const categoriaVideoExata = this.videosIndex.find(v => this.normalizar(v.categoryName) === termoN)?.categoryName;
    if (categoriaVideoExata) {
      this.router.navigate(['/app'], { queryParams: { tipo: 'categoria-video', cat: categoriaVideoExata, q: termo } });
      return;
    }

    const categoriaCardapioExata = this.cardapiosIndex.find(c => this.normalizar(c.categoryName) === termoN)?.categoryName;
    if (categoriaCardapioExata) {
      this.router.navigate(['/app/cardapios'], { queryParams: { tipo: 'categoria-cardapio', cat: categoriaCardapioExata, q: termo } });
      return;
    }

    this.router.navigate(['/app'], { queryParams: { q: termo } });
  }

  private normalizar(texto: string): string {
    return (texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private tokenizar(texto: string): string[] {
  const stop = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'as', 'os', 'um', 'uma', 'com', 'para', 'por']);
  return this.normalizar(texto)
    .split(/\s+/)
    .filter((p) => p.length >= 2 && !stop.has(p));
}

private pontuacao(item: string, tokens: string[]): number {
  const base = this.normalizar(item);
  return tokens.reduce((acc, t) => acc + (base.includes(t) ? 1 : 0), 0);
}

private ordenarPorRelevancia(lista: string[], tokens: string[]): string[] {
  return [...lista]
    .map((item) => ({ item, score: this.pontuacao(item, tokens) }))
    .filter((x) => x.score > 0)
    .sort((a, b) =>
      b.score - a.score ||
      a.item.localeCompare(b.item, 'pt-BR', { sensitivity: 'base' })
    )
    .map((x) => x.item);
}
  
}
