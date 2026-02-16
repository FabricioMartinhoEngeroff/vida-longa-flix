import { FormControl } from '@angular/forms';
import {
  calculatePasswordStrength,
  PasswordStrength,
  strongPasswordValidator,
} from './strong-password-validator';

describe('strong-password-validator', () => {
  it('should return very weak for empty password', () => {
    const result = calculatePasswordStrength('');

    expect(result.strength).toBe(PasswordStrength.VERY_WEAK);
    expect(result.message).toBe('Digite uma senha');
    expect(result.percentage).toBe(0);
  });

  it('should return very strong for complete password', () => {
    const result = calculatePasswordStrength('StrongPass1!');

    expect(result.strength).toBe(PasswordStrength.VERY_STRONG);
    expect(result.missingRequirements.length).toBe(0);
  });

  it('validator should accept empty to let required handle it', () => {
    const control = new FormControl('');
    const validator = strongPasswordValidator();

    expect(validator(control)).toBeNull();
  });

  it('validator should return error when strength is below minimum', () => {
    const control = new FormControl('abc');
    const validator = strongPasswordValidator(PasswordStrength.STRONG);
    const error = validator(control);

    expect(error).toBeTruthy();
    expect(error?.['senhaFraca']).toBeTruthy();
    expect(error?.['senhaFraca'].requisitosFaltando.length).toBeGreaterThan(0);
  });

  it('validator should return null when password meets minimum level', () => {
    const control = new FormControl('StrongPass1!');
    const validator = strongPasswordValidator(PasswordStrength.STRONG);

    expect(validator(control)).toBeNull();
  });
});