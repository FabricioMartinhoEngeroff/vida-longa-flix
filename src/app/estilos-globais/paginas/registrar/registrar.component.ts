import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CampoFormularioComponent } from '../../../auth/loginComponents/campo-formulario/campo-formulario.component';
import { BotaoPrimarioComponent } from '../../../auth/loginComponents/botao-primario/botao-primario.component';
import { IndicadorSenhaComponent } from '../../../auth/loginComponents/indicador-senha/indicador-senha.component'; // ← ADICIONAR
import { validadorSenhaForte, ForcaSenha } from '../../../auth/utils/validador-senha-forte'; // ← ADICIONAR

@Component({
  selector: 'app-registrar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CampoFormularioComponent,
    BotaoPrimarioComponent,
    IndicadorSenhaComponent, // ← ADICIONAR
  ],
  templateUrl: './registrar.component.html',
  styleUrls: ['./registrar.component.css'],
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
        numero: ['', [Validators.required]], 
        cidade: ['', [Validators.required]],
        estado: ['', [Validators.required]],
        cep: ['', [Validators.required]],
      }),
      // ✅ MODIFICADO: Adiciona validador de senha forte
      senha: ['', [
        Validators.required, 
        Validators.minLength(8),
        validadorSenhaForte(ForcaSenha.MEDIA) // ← Exige senha MÉDIA ou melhor
      ]],
    });
  }

  // ✅ ADICIONAR: Getter para pegar senha atual
  get senhaAtual(): string {
    return this.form.get('senha')?.value || '';
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
    
    // ✅ ADICIONAR: Tratamento de erro de senha fraca
    if (control.errors['senhaFraca']) {
      const requisitos = control.errors['senhaFraca'].requisitosFaltando;
      if (requisitos && requisitos.length > 0) {
        return requisitos[0]; // Retorna primeiro requisito faltando
      }
      return 'Senha não atende aos requisitos de segurança';
    }

    return 'Valor inválido';
  }

  async cadastrar() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.carregando = true;

    try {
      const dados = this.form.getRawValue();
      console.log('Cadastrar:', dados);

      this.router.navigateByUrl('/login');
    } finally {
      this.carregando = false;
    }
  }
}