import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CampoFormularioComponent } from '../../loginComponents/campo-formulario/campo-formulario.component';
import { BotaoPrimarioComponent } from '../../loginComponents/botao-primario/botao-primario.component';

@Component({
  selector: 'app-registrar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CampoFormularioComponent,
    BotaoPrimarioComponent,
  ],
  templateUrl: './registrar.component.html',
  styleUrl: './registrar.component.css',
})
export class RegistrarComponent {
  carregando = false;
  form: any;

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, Validators.minLength(11)]],
      telefone: ['', [Validators.required]],
      endereco: this.fb.group({
        rua: ['', [Validators.required]],
        bairro: ['', [Validators.required]],
        cidade: ['', [Validators.required]],
        estado: ['', [Validators.required]],
        cep: ['', [Validators.required]],
      }),
      senha: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.form.controls;
  }

  get end() {
    return this.form.controls.endereco.controls;
  }

  erroCampo(path: string): string | null {
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
    if (this.form.invalid) return;

    this.carregando = true;

    try {
      const dados = this.form.getRawValue();
      console.log('Cadastrar:', dados);

      // ✅ aqui vai ficar o request real (futuro)
      // await this.autenticacaoService.cadastrar(dados);

      this.router.navigateByUrl('/login');
    } finally {
      this.carregando = false;
    }
  }
}