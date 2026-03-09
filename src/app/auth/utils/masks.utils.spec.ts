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

describe('masks.utils — WhatsApp Welcome', () => {

  // ─── C8. Mascara de telefone — applyPhoneMaskAuto ──────────

  describe('C8. applyPhoneMaskAuto', () => {
    it('#41 input 11987654321 (11 digitos) — retorna (11) 98765-4321', () => {
      expect(applyPhoneMaskAuto('11987654321')).toBe('(11) 98765-4321');
    });

    it('#42 input 1134567890 (10 digitos) — retorna (11) 3456-7890', () => {
      expect(applyPhoneMaskAuto('1134567890')).toBe('(11) 3456-7890');
    });

    it('#43 input ja formatado (11) 98765-4321 — remove e reaplica mascara', () => {
      expect(applyPhoneMaskAuto('(11) 98765-4321')).toBe('(11) 98765-4321');
    });

    it('#44 input vazio "" — retorna ""', () => {
      expect(applyPhoneMaskAuto('')).toBe('');
    });

    it('#45 input null ou undefined — removeMask retorna "", sem erro', () => {
      expect(removeMask(null as any)).toBe('');
      expect(removeMask(undefined as any)).toBe('');
      // applyPhoneMaskAuto com string vazia
      expect(applyPhoneMaskAuto('')).toBe('');
    });

    it('#46 input com letras abc11987654321xyz — remove letras, aplica mascara', () => {
      expect(applyPhoneMaskAuto('abc11987654321xyz')).toBe('(11) 98765-4321');
    });
  });

  // ─── Mascaras gerais (testes pre-existentes) ───────────────

  describe('Mascaras gerais', () => {
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
});
