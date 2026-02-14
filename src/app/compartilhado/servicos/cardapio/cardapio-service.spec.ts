import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { CardapioService } from './cardapio-service';
import { FavoritosCardapiosService } from './ favoritos-cardapios';

describe('CardapioService', () => {
  let service: CardapioService;

  const favoritosMock = {
    adicionar: vi.fn(),
    remover: vi.fn(),
  };

  beforeEach(() => {
    favoritosMock.adicionar.mockReset();
    favoritosMock.remover.mockReset();

    TestBed.configureTestingModule({
      providers: [
        CardapioService,
        { provide: FavoritosCardapiosService, useValue: favoritosMock },
      ],
    });

    service = TestBed.inject(CardapioService);
  });

  it('deve carregar cardápios iniciais', () => {
    expect(service.cardapios.length).toBeGreaterThan(0);
  });

  it('deve adicionar, atualizar e remover cardápio', () => {
    const novo = {
      id: 'x1',
      title: 'Novo',
      description: 'Desc',
      capa: 'capa.jpg',
      category: { id: '1', name: 'Teste' },
      favorita: false,
      likesCount: 0,
    };

    service.add(novo as any);
    expect(service.cardapios[0].id).toBe('x1');

    service.update({ ...novo, title: 'Atualizado' } as any);
    expect(service.cardapios.find((c) => c.id === 'x1')?.title).toBe('Atualizado');

    service.remove('x1');
    expect(service.cardapios.some((c) => c.id === 'x1')).toBe(false);
  });

  it('deve alternar favorito, atualizar likes e chamar serviço de favoritos', () => {
    const alvo = {
      id: 'fav-1',
      title: 'Fav',
      description: 'Desc',
      capa: 'capa.jpg',
      category: { id: '1', name: 'Teste' },
      favorita: false,
      likesCount: 0,
    };
    service.add(alvo as any);

    service.toggleFavorite('fav-1');
    const aposCurtir = service.cardapios.find((c) => c.id === 'fav-1')!;
    expect(aposCurtir.favorita).toBe(true);
    expect(aposCurtir.likesCount).toBe(1);
    expect(favoritosMock.adicionar).toHaveBeenCalled();

    service.toggleFavorite('fav-1');
    const aposDescurtir = service.cardapios.find((c) => c.id === 'fav-1')!;
    expect(aposDescurtir.favorita).toBe(false);
    expect(aposDescurtir.likesCount).toBe(0);
    expect(favoritosMock.remover).toHaveBeenCalledWith('fav-1');
  });
});
