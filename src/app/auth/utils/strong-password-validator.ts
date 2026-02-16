import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export enum PasswordStrength {
  VERY_WEAK = 0,
  WEAK = 1,
  MEDIUM = 2,
  STRONG = 3,
  VERY_STRONG = 4
}

export const PASSWORD_CONFIG = {
  minLength: 8,
  requiresUppercase: true,
  requiresLowercase: true,
  requiresNumber: true,
  requiresSpecial: true,
  minStrengthLevel: PasswordStrength.MEDIUM
};

export interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  percentage: number;
  message: string;
  color: string;
  requirements: PasswordRequirements;
  missingRequirements: string[];
}

export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      strength: PasswordStrength.VERY_WEAK,
      percentage: 0,
      message: 'Digite uma senha',
      color: '#9ca3af',
      requirements: {
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false
      },
      missingRequirements: []
    };
  }

  const requirements: PasswordRequirements = {
    minLength: password.length >= PASSWORD_CONFIG.minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/'`~;]/.test(password)
  };

  let points = 0;
  if (requirements.minLength) points++;
  if (requirements.hasUppercase) points++;
  if (requirements.hasLowercase) points++;
  if (requirements.hasNumber) points++;
  if (requirements.hasSpecialChar) points++;

  if (password.length >= 12) points += 0.5;
  if (password.length >= 16) points += 0.5;

  let strength: PasswordStrength;
  let message: string;
  let percentage: number;
  let color: string;

  if (points < 2) {
    strength = PasswordStrength.VERY_WEAK;
    message = 'Muito fraca';
    percentage = 20;
    color = '#dc2626';
  } else if (points < 3) {
    strength = PasswordStrength.WEAK;
    message = 'Fraca';
    percentage = 40;
    color = '#f59e0b';
  } else if (points < 4) {
    strength = PasswordStrength.MEDIUM;
    message = 'Média';
    percentage = 60;
    color = '#eab308';
  } else if (points < 5) {
    strength = PasswordStrength.STRONG;
    message = 'Forte';
    percentage = 80;
    color = '#10b981';
  } else {
    strength = PasswordStrength.VERY_STRONG;
    message = 'Muito forte';
    percentage = 100;
    color = '#059669';
  }

  const missingRequirements: string[] = [];
  if (!requirements.minLength) {
    missingRequirements.push(`Mínimo ${PASSWORD_CONFIG.minLength} caracteres`);
  }
  if (PASSWORD_CONFIG.requiresUppercase && !requirements.hasUppercase) {
    missingRequirements.push('Uma letra maiúscula (A-Z)');
  }
  if (PASSWORD_CONFIG.requiresLowercase && !requirements.hasLowercase) {
    missingRequirements.push('Uma letra minúscula (a-z)');
  }
  if (PASSWORD_CONFIG.requiresNumber && !requirements.hasNumber) {
    missingRequirements.push('Um número (0-9)');
  }
  if (PASSWORD_CONFIG.requiresSpecial && !requirements.hasSpecialChar) {
    missingRequirements.push('Um caractere especial (!@#$%...)');
  }

  return { strength, percentage, message, color, requirements, missingRequirements };
}

export function strongPasswordValidator(
  minLevel: PasswordStrength = PASSWORD_CONFIG.minStrengthLevel
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.value;
    
    if (!password) {
      return null;
    }

    const result = calculatePasswordStrength(password);
    
    if (result.strength < minLevel) {
      return { 
        senhaFraca: { 
          forca: result.strength,
          mensagem: result.message,
          requisitos: result.requirements,
          requisitosFaltando: result.missingRequirements
        } 
      };
    }

    return null;
  };
}