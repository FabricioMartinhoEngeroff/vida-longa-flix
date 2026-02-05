import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { BotaoPrimarioComponent } from '../../componentes/botao-primario/botao-primario.component';
import { CampoFormularioComponent } from '../../componentes/campo-formulario/campo-formulario.component';
import { RecuperarSenhaComponent } from '../../componentes/recuperar-senha/recuperar-senha.component';
import { LoginForm } from '../../tipos/login-form.types';
import { ServicoAutenticacao } from '../../api/servico-autenticacao';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    BotaoPrimarioComponent,
    CampoFormularioComponent,
    RecuperarSenhaComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  carregando = false;
  form!: ReturnType<FormBuilder['group']>;
  recuperarAberta = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private servicoAutenticacao: ServicoAutenticacao
  ) {
    this.form = this.fb.group<LoginForm>({
      email: new FormControl('', { 
        nonNullable: true, 
        validators: [Validators.required, Validators.email] 
      }),
      password: new FormControl('', { 
        nonNullable: true, 
        validators: [Validators.required, Validators.minLength(6)] 
      }),
      manterConectado: new FormControl(false, { nonNullable: true })
    });
  }

  mensagemErro(campo: keyof LoginForm): string | null {
    const control = this.form.get(campo);
    if (!control || !control.touched || !control.errors) return null;

    if (control.errors['required']) return 'Campo obrigatório';
    if (control.errors['email']) return 'E-mail inválido';
    if (control.errors['minlength'])
      return `Mínimo de ${control.errors['minlength'].requiredLength} caracteres`;

    return 'Valor inválido';
  }

  async entrar() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.carregando = true;

    try {
      const { email, password } = this.form.getRawValue();
      await this.servicoAutenticacao.login(email, password);

      this.router.navigateByUrl('/app');
    } catch (e) {
      console.error(e);
    } finally {
      this.carregando = false;
    }
  }

  abrirRecuperarSenha() {
    this.recuperarAberta = true;
  }

  fecharRecuperarSenha() {
    this.recuperarAberta = false;
  }

  cadastrar() {
    this.router.navigateByUrl('/registrar');
  }
}