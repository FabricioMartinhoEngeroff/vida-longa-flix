import {
  applyZipCodeMask,
  applyCPFMask,
  applyCNPJMask,
  applyMobileMask,
  applyDateMask,
  applyRGMask,
  applyPhoneMask,
  applyPhoneMaskAuto,
  removeMask,
} from './masks.utils';

describe('masks.utils', () => {
  it('should remove all non-numeric characters', () => {
    expect(removeMask('123.456-78')).toBe('12345678');
    expect(removeMask('')).toBe('');
  });

  it('should apply CPF mask and limit to 11 digits', () => {
    expect(applyCPFMask('12345678900')).toBe('123.456.789-00');
    expect(applyCPFMask('12345678900123')).toBe('123.456.789-00');
  });

  it('should apply CNPJ mask', () => {
    expect(applyCNPJMask('12345678000190')).toBe('12.345.678/0001-90');
  });

  it('should apply landline and mobile phone masks', () => {
    expect(applyPhoneMask('1133334444')).toBe('(11) 3333-4444');
    expect(applyMobileMask('11987654321')).toBe('(11) 98765-4321');
  });

  it('should automatically choose phone mask', () => {
    expect(applyPhoneMaskAuto('1133334444')).toBe('(11) 3333-4444');
    expect(applyPhoneMaskAuto('11987654321')).toBe('(11) 98765-4321');
  });

  it('should apply zip code, RG and date masks', () => {
    expect(applyZipCodeMask('12345678')).toBe('12345-678');
    expect(applyRGMask('123456789')).toBe('12.345.678-9');
    expect(applyDateMask('01122025')).toBe('01/12/2025');
  });
});