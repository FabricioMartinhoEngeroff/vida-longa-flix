import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CampoFormularioComponent } from '../campo-formulario/campo-formulario.component';
import { NotificacaoService } from '../../../compartilhado/servicos/mensagem-alerta/mensagem-alerta.service';
import { EmailService } from '../../servicos/email/email.service';
import { MENSAGENS_PADRAO } from '../../../compartilhado/servicos/mensagem-alerta/mensagens-padrao.constants';

@Component({
  selector: 'app-recuperar-senha',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, CampoFormularioComponent],
  templateUrl: './recuperar-senha.component.html',
  styleUrls: ['./recuperar-senha.component.css']
})
export class RecuperarSenhaComponent {
  @Input() aberta = false;
  @Output() fechar = new EventEmitter<void>();

  form: FormGroup;
  enviando = false;

  constructor(
    private fb: FormBuilder,
    private notificacaoService: NotificacaoService,
    private emailService: EmailService 
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  erroCampo(campo: string): string | null {
    const control = this.form.get(campo);
    if (!control || !control.touched || !control.errors) return null;

    if (control.errors['required']) return 'Campo obrigatório';
    if (control.errors['email']) return 'E-mail inválido';

    return 'Valor inválido';
  }

  onFechar() {
    this.form.reset();
    this.fechar.emit();
  }

  async onEnviar() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.enviando = true;

    try {
      const { email } = this.form.getRawValue();
      
      await this.emailService.enviarRecuperacaoSenha(email);

      this.notificacaoService.exibirPadrao(MENSAGENS_PADRAO.EMAIL_RECUPERACAO_ENVIADO);
      
      setTimeout(() => {
        this.onFechar();
      }, 2000);

    } catch (e) {
      this.notificacaoService.exibirPadrao(MENSAGENS_PADRAO.ERRO_ENVIAR_EMAIL);
      console.error(e);
    } finally {
      this.enviando = false;
    }
  }
}