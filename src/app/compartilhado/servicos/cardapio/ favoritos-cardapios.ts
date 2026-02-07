import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cardapio } from '../../tipos/ cardapios';

@Injectable({ providedIn: 'root' })
export class FavoritosCardapiosService {
  private readonly favoritosSubject = new BehaviorSubject<Cardapio[]>([]);
  readonly favoritos$ = this.favoritosSubject.asObservable();

  adicionar(cardapio: Cardapio): void {
    const favoritos = this.favoritosSubject.value;
    if (!favoritos.some((f) => f.id === cardapio.id)) {
      this.favoritosSubject.next([...favoritos, cardapio]);
    }
  }

  remover(id: string): void {
    const favoritos = this.favoritosSubject.value.filter((c) => c.id !== id);
    this.favoritosSubject.next(favoritos);
  }
}
