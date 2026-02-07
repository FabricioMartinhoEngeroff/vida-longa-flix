import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CardapiosComponent } from './cardapios.component';
import { CardapioService } from '../../compartilhado/servicos/cardapio/cardapio-service';

describe('CardapiosComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardapiosComponent],
      providers: [
        {
          provide: CardapioService,
          useValue: { cardapios$: of([]) },
        },
      ],
    }).compileComponents();
  });

  it('deve criar o componente', () => {
    const fixture = TestBed.createComponent(CardapiosComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
