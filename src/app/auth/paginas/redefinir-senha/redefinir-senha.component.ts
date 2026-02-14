import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { IndicadorSenhaComponent } from '../../componentes/indicador-senha/indicador-senha.component';
import { BotaoPrimarioComponent } from '../../componentes/botao-primario/botao-primario.component';
import { CampoFormularioComponent } from '../../componentes/campo-formulario/campo-formulario.component';
import { NotificacaoService, obterDuracaoPadraoNotificacao } from '../../../compartilhado/servicos/mensagem-alerta/mensagem-alerta.service';
import { ServicoRecuperacaoSenha } from '../../servicos/servico-recuperacao-senha/servico-recuperacao-senha';
import { ForcaSenha, validadorSenhaForte } from '../../utils/validador-senha-forte';
import { MENSAGENS_PADRAO } from '../../../compartilhado/servicos/mensagem-alerta/mensagens-padrao.constants';



@Component({
  selector: 'app-redefinir-senha',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    CampoFormularioComponent,
    BotaoPrimarioComponent,
    IndicadorSenhaComponent
  ],
  templateUrl: './redefinir-senha.component.html',
  styleUrls: ['./redefinir-senha.component.css']
})
export class RedefinirSenhaComponent implements OnInit {
  form: FormGroup;
  carregando = false;
  validandoToken = true;
  tokenValido = false;
  token = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private notificacaoService: NotificacaoService,
    private servicoRecuperacao: ServicoRecuperacaoSenha
  ) {
    this.form = this.fb.group({
      novaSenha: ['', [
        Validators.required,
        Validators.minLength(8),
        validadorSenhaForte(ForcaSenha.FORTE)
      ]],
      confirmacaoSenha: ['', [Validators.required]]
    });
  }

  async ngOnInit() {
    // Pega token da URL
    this.token = this.route.snapshot.queryParams['token'];

    if (!this.token) {
      this.notificacaoService.exibirPadrao(MENSAGENS_PADRAO.TOKEN_INVALIDO);
      this.tokenValido = false;
      this.validandoToken = false;
      setTimeout(() => this.router.navigate(['/login']), obterDuracaoPadraoNotificacao('erro'));
      return;
    }

    // Valida token no backend
    try {
      this.tokenValido = await this.servicoRecuperacao.validarToken(this.token);
      
      if (!this.tokenValido) {
        this.notificacaoService.exibirPadrao(MENSAGENS_PADRAO.TOKEN_INVALIDO);
        setTimeout(() => this.router.navigate(['/login']), obterDuracaoPadraoNotificacao('erro'));
      }
    } catch (e) {
      this.notificacaoService.exibirPadrao(MENSAGENS_PADRAO.ERRO_VALIDAR_TOKEN);
      this.tokenValido = false;
    } finally {
      this.validandoToken = false;
    }
  }

  get senhaAtual(): string {
    return this.form.get('novaSenha')?.value || '';
  }

  erroCampo(path: string): string | null {
    const control = this.form.get(path);
    if (!control || !control.touched || !control.errors) return null;

    if (control.errors['required']) return 'Campo obrigatório';
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

  async redefinir() {
    this.form.markAllAsTouched();
    
    if (this.form.invalid) {
      this.notificacaoService.exibirPadrao(MENSAGENS_PADRAO.CORRIJA_ERROS);
      return;
    }

    const { novaSenha, confirmacaoSenha } = this.form.getRawValue();

    if (novaSenha !== confirmacaoSenha) {
      this.notificacaoService.exibirPadrao(MENSAGENS_PADRAO.SENHAS_NAO_COINCIDEM);
      return;
    }

    this.carregando = true;

    try {
      await this.servicoRecuperacao.redefinirSenha(this.token, novaSenha);

      this.notificacaoService.exibirPadrao(MENSAGENS_PADRAO.SENHA_REDEFINIDA);
      
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, obterDuracaoPadraoNotificacao('sucesso'));

    } catch (e) {
      this.notificacaoService.exibirPadrao(MENSAGENS_PADRAO.ERRO_REDEFINIR_SENHA);
      console.error(e);
    } finally {
      this.carregando = false;
    }
  }
}
