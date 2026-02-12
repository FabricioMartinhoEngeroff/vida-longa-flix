import { TestBed } from '@angular/core/testing';

import { VideoService } from './video';
import { FavoritosService } from '../favoritos/favoritos';

class FavoritosServiceMock {
  adicionarFavorito = jasmine.createSpy('adicionarFavorito');
  removerFavorito = jasmine.createSpy('removerFavorito');
}

describe('VideoService', () => {
  let service: VideoService;
  let favoritos: FavoritosServiceMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VideoService,
        { provide: FavoritosService, useClass: FavoritosServiceMock },
      ],
    });

    service = TestBed.inject(VideoService);
    favoritos = TestBed.inject(FavoritosService) as any;
  });

  it('deve criar o serviço', () => {
    expect(service).toBeTruthy();
  });

  it('deve carregar vídeos iniciais', () => {
    expect(service.videosReels.length).toBeGreaterThan(0);
  });

  it('deve alternar favorito e chamar serviço de favoritos', () => {
    const primeiro = service.videosReels[0];
    const id = primeiro.id;

    service.toggleFavorite(id);

    const atualizado = service.videosReels.find(v => v.id === id)!;
    if (atualizado.favorita) {
      expect(favoritos.adicionarFavorito).toHaveBeenCalled();
    } else {
      expect(favoritos.removerFavorito).toHaveBeenCalled();
    }
  });

  it('deve incrementar e decrementar likesCount ao alternar favorito', () => {
    const primeiro = service.videosReels[0];
    const id = primeiro.id;
    const likesIniciais = primeiro.likesCount ?? 0;

    service.toggleFavorite(id);
    const aposCurtir = service.videosReels.find((v) => v.id === id)!;
    expect(aposCurtir.likesCount).toBe(likesIniciais + 1);

    service.toggleFavorite(id);
    const aposDescurtir = service.videosReels.find((v) => v.id === id)!;
    expect(aposDescurtir.likesCount).toBe(Math.max(0, likesIniciais));
  });
});
