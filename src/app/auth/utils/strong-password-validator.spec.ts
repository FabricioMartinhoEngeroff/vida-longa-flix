import { FormControl } from '@angular/forms';
import {
  calculatePasswordStrength,
  PasswordStrength,
  strongPasswordValidator,
} from './strong-password-validator';

describe('strong-password-validator — Login & Register Scenarios', () => {

  // ─── B17. Forca da senha ─────────────────────────────────────

  describe('B17. calculatePasswordStrength', () => {
    it('#99 senha vazia — VERY_WEAK, 0%, "Digite uma senha"', () => {
      const result = calculatePasswordStrength('');

      expect(result.strength).toBe(PasswordStrength.VERY_WEAK);
      expect(result.percentage).toBe(0);
      expect(result.message).toBe('Digite uma senha');
      expect(result.color).toBe('#9ca3af');
    });

    it('#100 senha "abc" (1 ponto: lowercase) — VERY_WEAK', () => {
      const result = calculatePasswordStrength('abc');

      expect(result.strength).toBe(PasswordStrength.VERY_WEAK);
      expect(result.percentage).toBe(20);
      expect(result.message).toBe('Muito fraca');
    });

    it('#101 senha "abcdefgh" (2 pontos: length + lowercase) — WEAK', () => {
      const result = calculatePasswordStrength('abcdefgh');

      expect(result.strength).toBe(PasswordStrength.WEAK);
      expect(result.percentage).toBe(40);
      expect(result.message).toBe('Fraca');
    });

    it('#102 senha "Abcdefgh" (3 pontos: length + upper + lower) — MEDIUM', () => {
      const result = calculatePasswordStrength('Abcdefgh');

      expect(result.strength).toBe(PasswordStrength.MEDIUM);
      expect(result.percentage).toBe(60);
      expect(result.message).toBe('Média');
    });

    it('#104 senha "Abcdefgh1!" (5 pontos base) — VERY_STRONG', () => {
      const result = calculatePasswordStrength('Abcdefgh1!');

      expect(result.strength).toBe(PasswordStrength.VERY_STRONG);
      expect(result.percentage).toBe(100);
      expect(result.message).toBe('Muito forte');
      expect(result.missingRequirements.length).toBe(0);
    });

    it('#105 senha 12+ caracteres com todos requisitos — bonus +0.5', () => {
      const result = calculatePasswordStrength('StrongPass1!xx');

      expect(result.strength).toBe(PasswordStrength.VERY_STRONG);
      expect(result.percentage).toBe(100);
    });

    it('#106 senha 16+ caracteres com todos requisitos — bonus adicional', () => {
      const result = calculatePasswordStrength('StrongPassword1!');

      expect(result.strength).toBe(PasswordStrength.VERY_STRONG);
      expect(result.percentage).toBe(100);
    });

    it('missing requirements list corretamente', () => {
      const result = calculatePasswordStrength('abc');

      expect(result.missingRequirements).toContain('Mínimo 8 caracteres');
      expect(result.missingRequirements).toContain('Uma letra maiúscula (A-Z)');
      expect(result.missingRequirements).toContain('Um número (0-9)');
      expect(result.missingRequirements).toContain('Um caractere especial (!@#$%...)');
    });

    it('requirements object corretamente preenchido', () => {
      const result = calculatePasswordStrength('StrongPass1!');

      expect(result.requirements.minLength).toBe(true);
      expect(result.requirements.hasUppercase).toBe(true);
      expect(result.requirements.hasLowercase).toBe(true);
      expect(result.requirements.hasNumber).toBe(true);
      expect(result.requirements.hasSpecialChar).toBe(true);
    });
  });

  // ─── B17. strongPasswordValidator ────────────────────────────

  describe('B17. strongPasswordValidator', () => {
    it('#107 senha fraca com minLevel=STRONG — retorna senhaFraca', () => {
      const control = new FormControl('abc');
      const validator = strongPasswordValidator(PasswordStrength.STRONG);
      const error = validator(control);

      expect(error).toBeTruthy();
      expect(error?.['senhaFraca']).toBeTruthy();
      expect(error?.['senhaFraca'].requisitosFaltando.length).toBeGreaterThan(0);
      expect(error?.['senhaFraca'].forca).toBeDefined();
      expect(error?.['senhaFraca'].mensagem).toBeDefined();
    });

    it('#108 senha forte com minLevel=STRONG — retorna null', () => {
      const control = new FormControl('StrongPass1!');
      const validator = strongPasswordValidator(PasswordStrength.STRONG);

      expect(validator(control)).toBeNull();
    });

    it('senha vazia — retorna null (let required handle it)', () => {
      const control = new FormControl('');
      const validator = strongPasswordValidator();

      expect(validator(control)).toBeNull();
    });

    it('validator com minLevel default (MEDIUM)', () => {
      const control = new FormControl('Abcdefgh');
      const validator = strongPasswordValidator();

      // MEDIUM = 3 points needed, "Abcdefgh" has 3 points
      expect(validator(control)).toBeNull();
    });
  });
});
