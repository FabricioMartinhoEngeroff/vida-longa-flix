import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { BotaoPrimarioComponent } from '../../../auth/loginComponents/botao-primario/botao-primario.component';
import { CampoFormularioComponent } from '../../../auth/loginComponents/campo-formulario/campo-formulario.component';
import { LoginForm } from '../../../auth/tipos/login-form.types'; // ← IMPORTAR

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    BotaoPrimarioComponent,
    CampoFormularioComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  carregando = false;
  form!: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private router: Router
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
      const dados = this.form.getRawValue();
      console.log('📤 Dados login:', dados);
      
      // TODO: Integrar com backend
      
    } catch (error) {
      console.error('❌ Erro:', error);
    } finally {
      this.carregando = false;
    }
  }
}