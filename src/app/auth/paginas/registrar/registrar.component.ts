import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CampoFormularioComponent } from '../../componentes/campo-formulario/campo-formulario.component';
import { BotaoPrimarioComponent } from '../../componentes/botao-primario/botao-primario.component';
import { IndicadorSenhaComponent } from '../../componentes/indicador-senha/indicador-senha.component';
import { validadorSenhaForte, ForcaSenha } from '../../utils/validador-senha-forte';
import { NotificacaoService } from '../../../compartilhado/servicos/mensagem-alerta/mensagem-alerta.service';
import { EmailService } from '../../servicos/email/email.service';
import { MensagemAjusteEmailComponent, TipoErroEmail } from '../../../compartilhado/componentes/mensagem-alertas/mensagem-ajuste-email.component';

@Component({
  selector: 'app-registrar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CampoFormularioComponent,
    BotaoPrimarioComponent,
    IndicadorSenhaComponent,
    MensagemAjusteEmailComponent 
  ],
  templateUrl: './registrar.component.html',
  styleUrls: ['./registrar.component.css'],
})
export class RegistrarComponent {
  @Output() alternarParaLogin = new EventEmitter<void>();
  
  carregando = false;
  form: any;

  erroEmailTipo: TipoErroEmail = null;
  erroEmailMensagem?: string;
  dominioProblematico?: string;

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private notificacaoService: NotificacaoService,
    private emailService: EmailService  
  ) {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [
        Validators.required, 
        Validators.minLength(8),
        validadorSenhaForte(ForcaSenha.FORTE)
      ]],
    });
  

  this.form.get('email')?.valueChanges.subscribe(() => {
      this.atualizarErroEmail();
    });
  }

  get senhaAtual(): string {
    return this.form.get('senha')?.value || '';
  }

  get f() {
    return this.form.controls;
  }

  private atualizarErroEmail() {
    const emailControl = this.form.get('email');
    
    if (!emailControl || !emailControl.touched) {
      this.erroEmailTipo = null;
      return;
    }

    const errors = emailControl.errors;
    
    if (errors?.['emailTemporario']) {
      this.erroEmailTipo = 'temporario';
      this.erroEmailMensagem = errors['emailTemporario'].mensagem;
      this.dominioProblematico = errors['emailTemporario'].dominio;
    } else if (errors?.['emailSuspeito']) {
      this.erroEmailTipo = 'suspeito';
      this.erroEmailMensagem = errors['emailSuspeito'].mensagem;
      this.dominioProblematico = errors['emailSuspeito'].dominio;
    } else if (errors?.['emailInvalido']) {
      this.erroEmailTipo = 'invalido';
      this.erroEmailMensagem = errors['emailInvalido'].mensagem;
    } else {
      this.erroEmailTipo = null;
    }
  }

  erroCampo(path: string): string | null {
    const control = this.form.get(path);
    if (!control || !control.touched || !control.errors) return null;

    if (control.errors['required']) return 'Campo obrigatório';
    if (control.errors['email']) return 'E-mail inválido';
    if (control.errors['minlength'])
      return `Mínimo de ${control.errors['minlength'].requiredLength} caracteres`;
    
    if (control.errors['senhaFraca']) {
      const requisitos = control.errors['senhaFraca'].requisitosFaltando;
      if (requisitos && requisitos.length > 0) {
        return requisitos[0];
      }
      return 'Senha não atende aos requisitos de segurança';
    }

    return 'Valor inválido';
  }

  async cadastrar() {
  this.form.markAllAsTouched();
   this.atualizarErroEmail();

   const emailControl = this.form.get('email');
    if (emailControl?.errors?.['emailTemporario'] || emailControl?.errors?.['emailSuspeito']) {
      this.notificacaoService.erro('Por favor, use um email válido e profissional');
      return;
    }
  
  // ✅ ADICIONE: Detecta erro específico de senha fraca
  const senhaControl = this.form.get('senha');
  if (senhaControl?.errors?.['senhaFraca']) {
    const requisitos = senhaControl.errors['senhaFraca'].requisitosFaltando;
    if (requisitos && requisitos.length > 0) {
      this.notificacaoService.aviso(requisitos[0]); // Toast com requisito faltando
      return;
    }
  }
  
  // Verifica outros erros
  if (this.form.invalid) {
    this.notificacaoService.aviso('Corrija os erros antes de cadastrar');
    return;
  }

  this.carregando = true;

  try {
    const dados = this.form.getRawValue();
    console.log('✅ Dados do cadastro:', dados);

    // Simula delay do backend
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Envia email de boas-vindas
    await this.emailService.enviarBoasVindas({
      nome: dados.nome,
      email: dados.email
    });

    this.notificacaoService.sucesso('Conta criada! Entrando...');
    
    setTimeout(() => {
      this.router.navigateByUrl('/app');
    }, 1000);
    
  } catch (e) {
    this.notificacaoService.erro('Erro ao criar conta');
    console.error(e);
  } finally {
    this.carregando = false;
  }
}
}