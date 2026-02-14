import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { vi } from 'vitest';

import { BarraNavegacaoComponent } from './barra-navegacao.component';
import { ItemNavegacaoComponent } from '../item-navegacao/item-navegacao.component';
import { UsuarioAutenticacaoService } from '../../../auth/servicos/usuario-autenticacao.service';

describe('BarraNavegacaoComponent', () => {
  let component: BarraNavegacaoComponent;
  let fixture: ComponentFixture<BarraNavegacaoComponent>;
  let events$: Subject<any>;

  const authMock = { usuario: null };

  const routerMock = { navigate: vi.fn(), url: '/', events: new Subject<any>().asObservable() };

  beforeEach(async () => {
    events$ = new Subject<any>();
    routerMock.navigate.mockReset();
    routerMock.url = '/';
    routerMock.events = events$.asObservable();

    await TestBed.configureTestingModule({
      imports: [BarraNavegacaoComponent], 
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: UsuarioAutenticacaoService, useValue: authMock },
      ],
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
    expect(items.length).toBe(component.itensVisiveis.length);
  });

  it('should navigate when clicking a menu item', () => {
    const item = component.itens[0]; 

    component.clicarItem(item);

    expect(routerMock.navigate).toHaveBeenCalledWith([item.path]);
  });

  it('should set item as active from route url', () => {
    routerMock.url = '/app/favoritos';
    events$.next(new NavigationEnd(1, '/app/favoritos', '/app/favoritos'));

    expect(component.ativo).toBe('Favoritos');
  });
});
