import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { FavoritosService } from '../favoritos/favoritos';
import { Video } from '../../tipos/videos';

import videosIniciais from '../../../assets/videos-reels.json';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private readonly videosReelsSubject = new BehaviorSubject<Video[]>([]);
  readonly videosReels$ = this.videosReelsSubject.asObservable();

  constructor(private favoritosService: FavoritosService) {
    const convertidos = this.converterVideosMockados();
    this.videosReelsSubject.next(convertidos);
  }

  get videosReels(): Video[] {
    return this.videosReelsSubject.value;
  }

  toggleFavorite(id: string): void {
    const atualizados = this.videosReels.map((video) => {
      if (video.id !== id) return video;

      const atualizado = { ...video, favorita: !video.favorita };

      if (atualizado.favorita) {
        this.favoritosService.adicionarFavorito(atualizado);
      } else {
        this.favoritosService.removerFavorito(atualizado.id);
      }

      return atualizado;
    });

    this.videosReelsSubject.next(atualizados);
  }

  private converterVideosMockados(): Video[] {
    return (videosIniciais as any[]).map((video) => ({
      id: String(video.id),
      title: video.title,
      description: video.description,
      url: video.url,

      category: { id: '0', name: 'Sem categoria' },
      comments: [],
      views: 0,
      watchTime: 0,

      receita: video.receita || '',
      proteinas: video.proteinas ?? 0,
      carboidratos: video.carboidratos ?? 0,
      gorduras: video.gorduras ?? 0,
      fibras: video.fibras ?? 0,
      calorias: video.calorias ?? 0,

      favorita: video.favorita ?? false,
    })) as Video[];
  }
}
