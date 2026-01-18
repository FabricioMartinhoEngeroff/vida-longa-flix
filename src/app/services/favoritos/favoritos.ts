import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Video } from '../../tipos/videos';

@Injectable({
  providedIn: 'root',
})
export class FavoritosService {
  private readonly favoritosSubject = new BehaviorSubject<Video[]>([]);
  readonly favoritos$ = this.favoritosSubject.asObservable();

  listarFavoritos(): Video[] {
    return this.favoritosSubject.value;
  }

  adicionarFavorito(video: Video): void {
    const favoritos = this.favoritosSubject.value;

    if (!favoritos.some((fav) => fav.id === video.id)) {
      this.favoritosSubject.next([...favoritos, video]);
    }
  }

  removerFavorito(id: string): void {
    const favoritos = this.favoritosSubject.value.filter((v) => v.id !== id);
    this.favoritosSubject.next(favoritos);
  }
}
