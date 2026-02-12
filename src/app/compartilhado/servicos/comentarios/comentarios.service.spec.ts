import { TestBed } from '@angular/core/testing';

import { ComentariosService } from './comentarios.service';

describe('ComentariosService', () => {
  let service: ComentariosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComentariosService);
  });

  it('deve criar o serviço', () => {
    expect(service).toBeTruthy();
  });

  it('deve separar comentários por tipo e id', () => {
    service.add('video', '1', 'comentário vídeo');
    service.add('cardapio', '1', 'comentário cardápio');

    expect(service.get('video', '1')).toEqual(['Você: comentário vídeo']);
    expect(service.get('cardapio', '1')).toEqual(['Você: comentário cardápio']);
  });

  it('não deve adicionar comentário vazio', () => {
    service.add('video', '9', '   ');
    expect(service.get('video', '9')).toEqual([]);
  });
});
