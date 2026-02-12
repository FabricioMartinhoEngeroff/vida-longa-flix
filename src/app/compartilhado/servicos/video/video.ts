import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { FavoritosService } from '../favoritos/favoritos';
import { Video } from '../../tipos/videos';

import videosIniciais from '../../../../assets/videos-reels.json'

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

      const likesBase = video.likesCount ?? (video.favorita ? 1 : 0);
      const novoFavorito = !video.favorita;
      const novoLikes = novoFavorito
        ? likesBase + 1
        : Math.max(0, likesBase - 1);

      const atualizado = {
        ...video,
        favorita: novoFavorito,
        likesCount: novoLikes,
      };

      if (atualizado.favorita) {
        this.favoritosService.adicionarFavorito(atualizado);
      } else {
        this.favoritosService.removerFavorito(atualizado.id);
      }

      return atualizado;
    });

    this.videosReelsSubject.next(atualizados);
  }

  addVideo(video: Video): void {
  const atualizados = [video, ...this.videosReels];
  this.videosReelsSubject.next(atualizados);
}
  
  private converterVideosMockados(): Video[] {
  return (videosIniciais as any[]).map((video) => {
    const categoria = this.classificarCategoria(video.title, video.description);

    return {
      id: String(video.id),
      title: video.title,
      description: video.description,
      url: video.url,
      capa: video.capa || video.url,

      category: categoria,
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
      likesCount: video.likesCount ?? (video.favorita ? 1 : 0),
    };
  }) as Video[];
}

private classificarCategoria(title = '', description = ''): { id: string; name: string } {
  const t = (title + ' ' + description).toLowerCase();

  if (t.includes('bolo') || t.includes('cuca') || t.includes('brownie') || t.includes('cupcake')) {
    return { id: '1', name: 'Bolos' };
  }
  if (t.includes('pão') || t.includes('omelete') || t.includes('snack')) {
    return { id: '2', name: 'Salgados' };
  }
  if (t.includes('mousse') || t.includes('sobremesa')) {
    return { id: '3', name: 'Sobremesas' };
  }
  if (t.includes('dica') || t.includes('informações') || t.includes('omega')) {
    return { id: '4', name: 'Dicas da Nutri' };
  }
  return { id: '5', name: 'Receitas Práticas' };
}
}
