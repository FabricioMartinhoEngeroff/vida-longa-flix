import { TestBed } from '@angular/core/testing';

import { FavoritosCardapiosService } from './ favoritos-cardapios';

describe('FavoritosCardapiosService', () => {
  let service: FavoritosCardapiosService;

  const cardapio = {
    id: '1',
    title: 'Cardapio Teste',
    description: 'Descricao',
    capa: 'capa.jpg',
    category: { id: '1', name: 'Teste' },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavoritosCardapiosService);
  });

  it('deve adicionar favorito sem duplicar', () => {
    service.adicionar(cardapio as any);
    service.adicionar(cardapio as any);

    let atual: any[] = [];
    service.favoritos$.subscribe((f) => (atual = f));

    expect(atual.length).toBe(1);
  });

  it('deve remover favorito por id', () => {
    service.adicionar(cardapio as any);
    service.remover('1');

    let atual: any[] = [];
    service.favoritos$.subscribe((f) => (atual = f));

    expect(atual.length).toBe(0);
  });
});
