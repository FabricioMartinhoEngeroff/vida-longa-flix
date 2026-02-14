import {
  aplicarMascaraCEP,
  aplicarMascaraCPF,
  aplicarMascaraCNPJ,
  aplicarMascaraCelular,
  aplicarMascaraData,
  aplicarMascaraRG,
  aplicarMascaraTelefone,
  aplicarMascaraTelefoneAuto,
  removerMascara,
} from './mascaras.utils';

describe('mascaras.utils', () => {
  it('deve remover todos os caracteres não numéricos', () => {
    expect(removerMascara('123.456-78')).toBe('12345678');
    expect(removerMascara('')).toBe('');
  });

  it('deve aplicar máscara de CPF e limitar em 11 dígitos', () => {
    expect(aplicarMascaraCPF('12345678900')).toBe('123.456.789-00');
    expect(aplicarMascaraCPF('12345678900123')).toBe('123.456.789-00');
  });

  it('deve aplicar máscara de CNPJ', () => {
    expect(aplicarMascaraCNPJ('12345678000190')).toBe('12.345.678/0001-90');
  });

  it('deve aplicar máscara de telefone fixo e celular', () => {
    expect(aplicarMascaraTelefone('1133334444')).toBe('(11) 3333-4444');
    expect(aplicarMascaraCelular('11987654321')).toBe('(11) 98765-4321');
  });

  it('deve escolher automaticamente a máscara de telefone', () => {
    expect(aplicarMascaraTelefoneAuto('1133334444')).toBe('(11) 3333-4444');
    expect(aplicarMascaraTelefoneAuto('11987654321')).toBe('(11) 98765-4321');
  });

  it('deve aplicar máscaras de CEP, RG e Data', () => {
    expect(aplicarMascaraCEP('12345678')).toBe('12345-678');
    expect(aplicarMascaraRG('123456789')).toBe('12.345.678-9');
    expect(aplicarMascaraData('01122025')).toBe('01/12/2025');
  });
});
