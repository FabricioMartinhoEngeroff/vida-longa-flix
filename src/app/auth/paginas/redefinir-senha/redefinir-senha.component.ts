import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { IndicadorSenhaComponent } from '../../componentes/indicador-senha/indicador-senha.component';
import { BotaoPrimarioComponent } from '../../componentes/botao-primario/botao-primario.component';
import { CampoFormularioComponent } from '../../componentes/campo-formulario/campo-formulario.component';
import { NotificacaoService } from '../../../compartilhado/servicos/mensagem-alerta/mensagem-alerta.service';
import { ServicoRecuperacaoSenha } from '../../servicos/servico-recuperacao-senha/servico-recuperacao-senha';
import { ForcaSenha, validadorSenhaForte } from '../../utils/validador-senha-forte';



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
      this.notificacaoService.erro('Link inválido ou expirado');
      this.tokenValido = false;
      this.validandoToken = false;
      setTimeout(() => this.router.navigate(['/login']), 3000);
      return;
    }

    // Valida token no backend
    try {
      this.tokenValido = await this.servicoRecuperacao.validarToken(this.token);
      
      if (!this.tokenValido) {
        this.notificacaoService.erro('Link inválido ou expirado');
        setTimeout(() => this.router.navigate(['/login']), 3000);
      }
    } catch (e) {
      this.notificacaoService.erro('Erro ao validar link');
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
      this.notificacaoService.aviso('Corrija os erros antes de continuar');
      return;
    }

    const { novaSenha, confirmacaoSenha } = this.form.getRawValue();

    if (novaSenha !== confirmacaoSenha) {
      this.notificacaoService.erro('As senhas digitadas não são iguais');
      return;
    }

    this.carregando = true;

    try {
      await this.servicoRecuperacao.redefinirSenha(this.token, novaSenha);

      this.notificacaoService.sucesso('Senha redefinida com sucesso! Redirecionando...');
      
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);

    } catch (e) {
      this.notificacaoService.erro('Erro ao redefinir senha. Tente novamente.');
      console.error(e);
    } finally {
      this.carregando = false;
    }
  }
}