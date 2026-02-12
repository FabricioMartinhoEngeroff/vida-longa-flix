import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cardapio } from '../../tipos/ cardapios';
import cardapiosIniciais from '../../../../assets/cardapios.json';
import { FavoritosCardapiosService } from './ favoritos-cardapios';


@Injectable({
  providedIn: 'root',
})
export class CardapioService {
  private readonly cardapiosSubject = new BehaviorSubject<Cardapio[]>([]);
  readonly cardapios$ = this.cardapiosSubject.asObservable();

constructor(private favoritos: FavoritosCardapiosService) {
  const convertidos = this.converterMockados();
  this.cardapiosSubject.next(convertidos);
}

  get cardapios(): Cardapio[] {
    return this.cardapiosSubject.value;
  }

  add(cardapio: Cardapio): void {
    const atualizados = [cardapio, ...this.cardapios];
    this.cardapiosSubject.next(atualizados);
  }

  update(cardapio: Cardapio): void {
    const atualizados = this.cardapios.map(c => c.id === cardapio.id ? cardapio : c);
    this.cardapiosSubject.next(atualizados);
  }

  remove(id: string): void {
    const atualizados = this.cardapios.filter(c => c.id !== id);
    this.cardapiosSubject.next(atualizados);
  }

  toggleFavorite(id: string): void {
  const atualizados = this.cardapios.map((c) => {
    if (c.id !== id) return c;

    const likesBase = c.likesCount ?? (c.favorita ? 1 : 0);
    const novoFavorito = !c.favorita;
    const novoLikes = novoFavorito
      ? likesBase + 1
      : Math.max(0, likesBase - 1);

    const atualizado = {
      ...c,
      favorita: novoFavorito,
      likesCount: novoLikes,
    };
    if (atualizado.favorita) {
      this.favoritos.adicionar(atualizado);
    } else {
      this.favoritos.remover(atualizado.id);
    }
    return atualizado;
  });

  this.cardapiosSubject.next(atualizados);
}


  private converterMockados(): Cardapio[] {
  return (cardapiosIniciais as any[]).map((c) => ({
    id: String(c.id),
    title: c.title,
    description: c.description,
    capa: c.capa,
    category: c.category ?? { id: '0', name: 'Sem categoria' },

    receita: c.receita ?? '',
    dicasNutri: c.dicasNutri ?? '',
    proteinas: c.proteinas ?? 0,
    carboidratos: c.carboidratos ?? 0,
    gorduras: c.gorduras ?? 0,
    fibras: c.fibras ?? 0,
    calorias: c.calorias ?? 0,
    favorita: c.favorita ?? false,
    likesCount: c.likesCount ?? (c.favorita ? 1 : 0),
  })) as Cardapio[];
}

}
