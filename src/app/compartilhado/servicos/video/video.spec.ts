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
});
