import { Injectable } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

export interface Address {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface FormData {
  email: string;
  password: string;
  name: string;
  taxId: string;
  phone: string;
  address: Address;
}

export interface FormErrors {
  name: string | null;
  email: string | null;
  password: string | null;
  taxId: string | null;
  phone: string | null;
  address: {
    street: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
  };
}

type RegisterForm = {
  email: FormControl<string>;
  password: FormControl<string>;
  name: FormControl<string>;
  taxId: FormControl<string>;
  phone: FormControl<string>;
  address: any;
};

@Injectable({ providedIn: 'root' })
export class LoginFormService {
  passwordVisible = false;

  errors: FormErrors = {
    name: null,
    email: null,
    password: null,
    taxId: null,
    phone: null,
    address: {
      street: null,
      neighborhood: null,
      city: null,
      state: null,
      zipCode: null,
    },
  };

   form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.form = this.fb.group<RegisterForm>({
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      taxId: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      phone: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      address: this.fb.group({
        street: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        neighborhood: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        city: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        state: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        zipCode: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      }),
    });
    
    this.setupMasks();
    this.setupDynamicErrors();
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  private setupMasks() {
  const taxIdControl = this.form.get('taxId');
  const phoneControl = this.form.get('phone');

  taxIdControl?.valueChanges.subscribe((value: string | null) => {
    const v = value ?? '';
    const masked = this.maskCPF(v);

    if (masked !== v) {
      taxIdControl.setValue(masked, { emitEvent: false });
    }
  });

  phoneControl?.valueChanges.subscribe((value: string | null) => {
    const v = value ?? '';
    const masked = this.maskPhone(v);

    if (masked !== v) {
      phoneControl.setValue(masked, { emitEvent: false });
    }
  });
}

  private setupDynamicErrors() {
    this.form.valueChanges.subscribe(() => {
      this.errors.email = this.getErrorMessage('email');
      this.errors.password = this.getErrorMessage('password');
      this.errors.name = this.getErrorMessage('name');
      this.errors.taxId = this.getErrorMessage('taxId');
      this.errors.phone = this.getErrorMessage('phone');

      this.errors.address.street = this.getErrorMessage('address.street');
      this.errors.address.neighborhood = this.getErrorMessage('address.neighborhood');
      this.errors.address.city = this.getErrorMessage('address.city');
      this.errors.address.state = this.getErrorMessage('address.state');
      this.errors.address.zipCode = this.getErrorMessage('address.zipCode');
    });
  }

  private getErrorMessage(path: string): string | null {
    const control = this.form.get(path);
    if (!control || !control.touched || !control.errors) return null;

    if (control.errors['required']) return 'Required field';
    if (control.errors['email']) return 'Invalid email';
    if (control.errors['minlength'])
      return 'Minimum ' + control.errors['minlength'].requiredLength + ' characters';

    return 'Invalid value';
  }

  async register() {
    this.form.markAllAsTouched();
    
    if (this.form.invalid) {
      throw new Error('Invalid form');
    }

    const data = this.form.getRawValue() as FormData;

    const responseFake = { token: 'fake_token_123' };

    if (responseFake?.token) {
      localStorage.setItem('token', responseFake.token);
      this.router.navigateByUrl('/insights');
      return;
    }

    throw new Error('Token not returned');
  }

  private maskPhone(value: string): string {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }

  private maskCPF(value: string): string {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9)
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  }
}