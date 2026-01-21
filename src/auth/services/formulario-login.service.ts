import { Injectable } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

export interface Endereco {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface DadosFormulario {
  email: string;
  password: string;
  name: string;
  cpf: string;
  telefone: string;
  endereco: Endereco;
}

export interface ErrosFormulario {
  name: string | null;
  email: string | null;
  password: string | null;
  cpf: string | null;
  telefone: string | null;
  endereco: {
    rua: string | null;
    bairro: string | null;
    cidade: string | null;
    estado: string | null;
    cep: string | null;
  };
}

type FormCadastro = {
  email: FormControl<string>;
  password: FormControl<string>;
  name: FormControl<string>;
  cpf: FormControl<string>;
  telefone: FormControl<string>;
  endereco: any;
};

@Injectable({ providedIn: 'root' })
export class FormularioLoginService {
  passwordVisible = false;

  errors: ErrosFormulario = {
    name: null,
    email: null,
    password: null,
    cpf: null,
    telefone: null,
    endereco: {
      rua: null,
      bairro: null,
      cidade: null,
      estado: null,
      cep: null,
    },
  };

  form!: any;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.form = this.fb.group<FormCadastro>({
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
      cpf: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      telefone: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      endereco: this.fb.group({
        rua: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        bairro: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        cidade: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        estado: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        cep: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      }),
    });
    this.configurarMascaras();
    this.configurarErrosDinamicos();
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  private configurarMascaras() {
    // CPF
    this.form.controls.cpf.valueChanges.subscribe((valor) => {
      const mascarado = this.maskCPF(valor);
      if (mascarado !== valor) {
        this.form.controls.cpf.setValue(mascarado, { emitEvent: false });
      }
    });

    // Telefone
    this.form.controls.telefone.valueChanges.subscribe((valor) => {
      const mascarado = this.maskPhone(valor);
      if (mascarado !== valor) {
        this.form.controls.telefone.setValue(mascarado, { emitEvent: false });
      }
    });
  }

  private configurarErrosDinamicos() {
    // Aqui tu faz algo parecido com "setErrors" do hook
    // no Angular normalmente a UI lê do FormControl.errors,
    // mas vou manter esse objeto errors igual teu React.

    this.form.valueChanges.subscribe(() => {
      this.errors.email = this.getMensagemErro('email');
      this.errors.password = this.getMensagemErro('password');
      this.errors.name = this.getMensagemErro('name');
      this.errors.cpf = this.getMensagemErro('cpf');
      this.errors.telefone = this.getMensagemErro('telefone');

      this.errors.endereco.rua = this.getMensagemErro('endereco.rua');
      this.errors.endereco.bairro = this.getMensagemErro('endereco.bairro');
      this.errors.endereco.cidade = this.getMensagemErro('endereco.cidade');
      this.errors.endereco.estado = this.getMensagemErro('endereco.estado');
      this.errors.endereco.cep = this.getMensagemErro('endereco.cep');
    });
  }

  private getMensagemErro(path: string): string | null {
    const control = this.form.get(path);
    if (!control || !control.touched || !control.errors) return null;

    if (control.errors['required']) return 'Campo obrigatório';
    if (control.errors['email']) return 'E-mail inválido';
    if (control.errors['minlength'])
      return `Mínimo de ${control.errors['minlength'].requiredLength} caracteres`;

    return 'Valor inválido';
  }

  async cadastrar() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      throw new Error('Formulário inválido');
    }

    const dados = this.form.getRawValue() as DadosFormulario;

    // ⚠️ Aqui seria o equivalente ao:
    // const response = await register(formData);

    // EXEMPLO: simulando resposta
    const responseFake = { token: 'token_fake_123' };

    if (responseFake?.token) {
      localStorage.setItem('token', responseFake.token);
      this.router.navigateByUrl('/insights');
      return;
    }

    throw new Error('Token não retornado');
  }

  // ========================
  // Máscaras (igual React)
  // ========================
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
