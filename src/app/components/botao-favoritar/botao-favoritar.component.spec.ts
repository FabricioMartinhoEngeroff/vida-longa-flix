import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotaoFavoritar } from './botao-favoritar.component';

describe('BotaoFavoritar', () => {
  let component: BotaoFavoritar;
  let fixture: ComponentFixture<BotaoFavoritar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotaoFavoritar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BotaoFavoritar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
