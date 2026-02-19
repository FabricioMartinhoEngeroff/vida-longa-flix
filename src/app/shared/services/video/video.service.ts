import { Injectable, signal, computed } from '@angular/core';
import initialVideos from '../../../../assets/videos-reels.json';
import { Video } from '../../types/videos';
import { FavoritesService } from '../favorites/favorites.service.';

@Injectable({
  providedIn: 'root',
})
export class VideoService {

  private videosSignal = signal<Video[]>([]);

  readonly videos = this.videosSignal.asReadonly();

  readonly totalVideos = computed(() => this.videosSignal().length);

  readonly totalLikes = computed(() =>
    this.videosSignal().reduce((sum, v) => sum + (v.likesCount ?? 0), 0)
  );

  constructor(private favoritesService: FavoritesService) {
    
    const converted = this.convertMockedVideos();
    this.videosSignal.set(converted);
  }

  toggleFavorite(id: string): void {
    this.videosSignal.update(current =>
      current.map(video => {
        if (video.id !== id) return video;

        const likesBase = video.likesCount ?? (video.favorited ? 1 : 0);
        const newFavorited = !video.favorited;
        const newLikes = newFavorited
          ? likesBase + 1
          : Math.max(0, likesBase - 1);

        const updated = {
          ...video,
          favorited: newFavorited,
          likesCount: newLikes,
        };

        if (updated.favorited) {
          this.favoritesService.addFavorite(updated);
        } else {
          this.favoritesService.removeFavorite(updated.id);
        }

        return updated;
      })
    );
  }

 
  addVideo(video: Video): void {
    this.videosSignal.update(current => [video, ...current]);
  }

  removeVideo(id: string): void {
    this.videosSignal.update(current => current.filter(v => v.id !== id));
    this.favoritesService.removeFavorite(id);
  }

  getVideoById(id: string): Video | undefined {
    return this.videosSignal().find(v => v.id === id);
  }

  getVideosByCategory(categoryId: string): Video[] {
    return this.videosSignal().filter(v => v.category.id === categoryId);
  }

 
private convertMockedVideos(): Video[] {
  return (initialVideos as any[]).map((video) => {
    const category = this.classifyCategory(video.title, video.description);

    return {
      id: String(video.id),
      title: video.title,
      description: video.description,
      url: video.url,
      cover: video.capa || video.url,  

      category: category,
      comments: [],
      views: 0,
      watchTime: 0,

      recipe: video.receita || '',
      protein: video.proteinas ?? 0,
      carbs: video.carboidratos ?? 0,
      fat: video.gorduras ?? 0,
      fiber: video.fibras ?? 0,
      calories: video.calorias ?? 0,

      favorited: video.favorita ?? false,  
      likesCount: video.likesCount ?? (video.favorita ? 1 : 0),
    };
  }) as Video[];
}

  
  private classifyCategory(title = '', description = ''): { id: string; name: string } {
    const text = (title + ' ' + description).toLowerCase();

    if (text.includes('bolo') || text.includes('cuca') || text.includes('brownie') || text.includes('cupcake')) {
      return { id: '1', name: 'Bolos' };
    }
    if (text.includes('pão') || text.includes('omelete') || text.includes('snack')) {
      return { id: '2', name: 'Salgados' };
    }
    if (text.includes('mousse') || text.includes('sobremesa')) {
      return { id: '3', name: 'Sobremesas' };
    }
    if (text.includes('dica') || text.includes('informações') || text.includes('omega')) {
      return { id: '4', name: 'Dicas da Nutri' };
    }
    return { id: '5', name: 'Receitas Práticas' };
  }
}