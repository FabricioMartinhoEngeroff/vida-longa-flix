import { validarUUID } from './validar-uuid';

describe('validarUUID', () => {
  it('deve validar UUID correto', () => {
    expect(validarUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('deve rejeitar UUID inválido', () => {
    expect(validarUUID('123')).toBe(false);
    expect(validarUUID('550e8400e29b41d4a716446655440000')).toBe(false);
  });
});
