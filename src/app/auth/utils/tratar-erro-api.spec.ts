import { HttpErrorResponse } from '@angular/common/http';
import { afterEach, vi } from 'vitest';

import { tratarErroApi } from './tratar-erro-api';

describe('tratarErroApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve priorizar mensagem do HttpErrorResponse quando vier em objeto', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const erroHttp = new HttpErrorResponse({
      status: 400,
      error: { message: 'Erro do backend' },
    });

    expect(() => tratarErroApi(erroHttp, 'Padrão')).toThrowError('Erro do backend');
  });

  it('deve usar mensagem de erro genérico de JS', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => tratarErroApi(new Error('Falha de rede'), 'Padrão')).toThrowError('Falha de rede');
  });

  it('deve cair para mensagem padrão quando erro não mapeado', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => tratarErroApi({ qualquer: true }, 'Mensagem padrão')).toThrowError('Mensagem padrão');
  });
});
