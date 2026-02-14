import { FormControl } from '@angular/forms';

import {
  calcularForcaSenha,
  ForcaSenha,
  validadorSenhaForte,
} from './validador-senha-forte';

describe('validador-senha-forte', () => {
  it('deve retornar senha muito fraca para senha vazia', () => {
    const resultado = calcularForcaSenha('');

    expect(resultado.forca).toBe(ForcaSenha.MUITO_FRACA);
    expect(resultado.mensagem).toBe('Digite uma senha');
    expect(resultado.porcentagem).toBe(0);
  });

  it('deve retornar senha muito forte para senha completa', () => {
    const resultado = calcularForcaSenha('SenhaForte1!');

    expect(resultado.forca).toBe(ForcaSenha.MUITO_FORTE);
    expect(resultado.requisitosFaltando.length).toBe(0);
  });

  it('validador deve aceitar vazio para deixar required atuar', () => {
    const control = new FormControl('');
    const validator = validadorSenhaForte();

    expect(validator(control)).toBeNull();
  });

  it('validador deve retornar erro quando força for menor que o mínimo', () => {
    const control = new FormControl('abc');
    const validator = validadorSenhaForte(ForcaSenha.FORTE);
    const erro = validator(control);

    expect(erro).toBeTruthy();
    expect(erro?.['senhaFraca']).toBeTruthy();
    expect(erro?.['senhaFraca'].requisitosFaltando.length).toBeGreaterThan(0);
  });

  it('validador deve retornar null quando senha atende o nível mínimo', () => {
    const control = new FormControl('SenhaForte1!');
    const validator = validadorSenhaForte(ForcaSenha.FORTE);

    expect(validator(control)).toBeNull();
  });
});
