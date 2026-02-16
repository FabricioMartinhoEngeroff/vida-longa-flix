import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { vi } from 'vitest';

import { CardapiosComponent } from './cardapios.component';
import { CardapioService } from '../../shared/services/menus/menus-service';
import { ComentariosService } from '../../shared/services/comentarios/comentarios.service';

describe('CardapiosComponent', () => {
  const comentariosState$ = new BehaviorSubject<Record<string, string[]>>({});

  const cardapioServiceMock = {
    cardapios$: of([]),
    toggleFavorite: vi.fn(),
  };

  const comentariosServiceMock = {
    comentarios$: comentariosState$.asObservable(),
    add: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardapiosComponent],
      providers: [
        { provide: CardapioService, useValue: cardapioServiceMock },
        { provide: ComentariosService, useValue: comentariosServiceMock },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
    }).compileComponents();
  });

  it('deve criar o componente', () => {
    const fixture = TestBed.createComponent(CardapiosComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('deve contar e obter comentários por chave de cardápio', () => {
    const fixture = TestBed.createComponent(CardapiosComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    comentariosState$.next({
      'cardapio:7': ['Você: ótimo'],
      'video:7': ['Você: vídeo'],
    });

    expect(component.totalComentarios('7')).toBe(1);
    expect(component.comentariosDoCardapio('7')).toEqual(['Você: ótimo']);
  });

  it('deve adicionar comentário com tipo cardapio', () => {
    const fixture = TestBed.createComponent(CardapiosComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.adicionarComentario('42', 'novo');

    expect(comentariosServiceMock.add).toHaveBeenCalledWith(
      'cardapio',
      '42',
      'novo'
    );
  });
});
