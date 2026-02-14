import { TestBed } from '@angular/core/testing';

import { MascaraService } from './mascara.service';

describe('MascaraService', () => {
  let service: MascaraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MascaraService);
  });

  it('deve aplicar máscara conforme o tipo', () => {
    expect(service.aplicar('12345678900', 'cpf')).toBe('123.456.789-00');
    expect(service.aplicar('12345678', 'cep')).toBe('12345-678');
  });

  it('deve remover máscara', () => {
    expect(service.remover('(11) 98765-4321')).toBe('11987654321');
  });

  it('deve validar quando valor está completo para o tipo', () => {
    expect(service.estaCompleto('123.456.789-00', 'cpf')).toBe(true);
    expect(service.estaCompleto('12345-67', 'cep')).toBe(false);
  });

  it('deve retornar valor original para tipo não mapeado', () => {
    expect(service.aplicar('abc', 'inexistente' as any)).toBe('abc');
  });
});
