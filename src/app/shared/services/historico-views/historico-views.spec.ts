import { TestBed } from '@angular/core/testing';

import { HistoricoViewsService } from './historico-views';

describe('HistoricoViewsService', () => {
  let service: HistoricoViewsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoricoViewsService);
  });

  it('deve registrar views incrementando por vídeo', () => {
    service.registrarView('user@email.com', 'v1');
    service.registrarView('user@email.com', 'v1');

    expect(service.getViewsDoVideo('user@email.com', 'v1')).toBe(2);
  });

  it('não deve registrar quando email ou videoId estiver vazio', () => {
    service.registrarView('', 'v1');
    service.registrarView('user@email.com', '');

    expect(service.getViews('user@email.com')).toEqual({});
  });

  it('deve retornar objeto vazio quando JSON em storage for inválido', () => {
    localStorage.setItem('vida-longa-flix:views:user@email.com', '{invalido');

    expect(service.getViews('user@email.com')).toEqual({});
  });
});
