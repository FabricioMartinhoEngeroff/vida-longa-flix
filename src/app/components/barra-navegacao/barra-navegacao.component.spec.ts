import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { BarraNavegacaoComponent } from './barra-navegacao.component';
import { ItemNavegacaoComponent } from '../item-navegacao/item-navegacao.component';

describe('BarraNavegacaoComponent', () => {
  let component: BarraNavegacaoComponent;
  let fixture: ComponentFixture<BarraNavegacaoComponent>;

  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
    url: '/',
    events: {
      pipe: () => ({ subscribe: () => {} }),
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarraNavegacaoComponent], 
      providers: [{ provide: Router, useValue: routerMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(BarraNavegacaoComponent);
    component = fixture.componentInstance;

    fixture.detectChanges(); 
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render menu items', () => {
    const items = fixture.debugElement.queryAll(By.directive(ItemNavegacaoComponent));
    expect(items.length).toBe(component.itens.length);
  });

  it('should navigate when clicking a menu item', () => {
    const item = component.itens[0]; 

    component.clicarItem(item);

    expect(routerMock.navigate).toHaveBeenCalledWith([item.path]);
  });

  it('should set item as active when clicarItem is called', () => {
    const item = component.itens[2]; 
    component.clicarItem(item);
    fixture.detectChanges();

    expect(component.ativo).toBe(item.nome);
  });
});
