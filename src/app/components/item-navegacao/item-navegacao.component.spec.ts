import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemNavegacao } from './item-navegacao.component';

describe('ItemNavegacao', () => {
  let component: ItemNavegacao;
  let fixture: ComponentFixture<ItemNavegacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemNavegacao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemNavegacao);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
