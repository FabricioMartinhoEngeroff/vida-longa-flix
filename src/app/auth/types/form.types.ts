import { FormControl } from '@angular/forms';

export type MaskType = 
  | 'cpf' 
  | 'cnpj' 
  | 'phone' 
  | 'mobile'
  | 'zipcode' 
  | 'rg' 
  | 'date';

export interface MaskConfiguration {
  type: MaskType;
  maxLength: number;
  placeholder?: string;
  showCounter?: boolean;
}

export const MASK_CONFIGURATIONS: Record<MaskType, MaskConfiguration> = {
  cpf: {
    type: 'cpf',
    maxLength: 14,
    placeholder: '000.000.000-00',
    showCounter: false
  },
  cnpj: {
    type: 'cnpj',
    maxLength: 18,
    placeholder: '00.000.000/0000-00',
    showCounter: false
  },
  phone: {
    type: 'phone',
    maxLength: 15, 
    placeholder: '(00) 00000-0000',
    showCounter: false
  },
  mobile: {
    type: 'mobile',
    maxLength: 15,
    placeholder: '(00) 00000-0000',
    showCounter: false
  },
  zipcode: {
    type: 'zipcode',
    maxLength: 9,
    placeholder: '00000-000',
    showCounter: false
  },
  rg: {
    type: 'rg',
    maxLength: 12,
    placeholder: '00.000.000-0',
    showCounter: false
  },
  date: {
    type: 'date',
    maxLength: 10,
    placeholder: '00/00/0000',
    showCounter: false
  }
};

export type LoginForm = {
  email: FormControl<string>;
  password: FormControl<string>;
  keepLoggedIn: FormControl<boolean>;
};

export type RegisterForm = {
  name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  phone: FormControl<string>;
};

export type ProfileForm = {
  name: FormControl<string>;
  email: FormControl<string>;
  taxId: FormControl<string>;
  phone: FormControl<string>;
  address: {
    street: FormControl<string>;
    number: FormControl<string>;
    neighborhood: FormControl<string>;
    city: FormControl<string>;
    state: FormControl<string>;
    zipCode: FormControl<string>;
  };
};

export type ChangePasswordForm = {
  currentPassword: FormControl<string>;
  newPassword: FormControl<string>;
};

export type EmailErrorType = 'temporary' | 'suspicious' | 'invalid' | 'suggestion' | null;

export interface EmailErrorConfig {
  icon: string;
  color: string;
  title: string;
  message: string;
}

export function validateCPFFormat(cpf: string): boolean {
  const numbersOnly = cpf.replace(/\D/g, '');
  return numbersOnly.length === 11;
}

export function validatePhoneFormat(phone: string): boolean {
  const numbersOnly = phone.replace(/\D/g, '');
  return numbersOnly.length === 10 || numbersOnly.length === 11;
}

export function validateZipCodeFormat(zipCode: string): boolean {
  const numbersOnly = zipCode.replace(/\D/g, '');
  return numbersOnly.length === 8;
}