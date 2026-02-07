import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { IndicadorSenhaComponent } from '../../../auth/componentes/indicador-senha/indicador-senha.component';  
import { calcularForcaSenha, ForcaSenha } from '../../../auth/utils/validador-senha-forte';  
import { NotificacaoService } from '../../../../app/compartilhado/servicos/mensagem-alerta/mensagem-alerta.service';
import { MENSAGENS_PADRAO } from '../../servicos/mensagem-alerta/mensagens-padrao.constants';

@Component({
  selector: 'app-modal-mudar-senha',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, 
    MatIconModule,
    IndicadorSenhaComponent 
  ],
  templateUrl: './modal-mudar-senha.component.html',
  styleUrls: ['./modal-mudar-senha.component.css']
})


export class ModalMudarSenhaComponent {
  @Input() aberta = false;
  @Output() fechar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<{ senhaAtual: string; novaSenha: string }>();

  senhaAtual = '';
  novaSenha = '';
  confirmacaoSenha = '';

  mostrarSenhaAtual = false;
  mostrarNovaSenha = false;
  mostrarConfirmacao = false;

  erro = '';

  constructor(private notificacaoService: NotificacaoService) {}

  onFechar() {
    this.limparCampos();
    this.fechar.emit();
  }

  onConfirmar() {
    this.erro = '';

    if (!this.senhaAtual || !this.novaSenha || !this.confirmacaoSenha) {
      this.erro = 'Preencha todos os campos';
      return;
    }

    if (this.novaSenha.length < 8) {
      this.erro = 'Nova senha deve ter no mínimo 8 caracteres';
      return;
    }

    if (this.novaSenha !== this.confirmacaoSenha) {
      this.erro = 'As senhas digitadas não são iguais';
      return;
    }

    if (this.senhaAtual === this.novaSenha) {
      this.erro = 'A nova senha deve ser diferente da atual';
      return;
    }

  const resultado = calcularForcaSenha(this.novaSenha);

    if (resultado.forca < ForcaSenha.FORTE) {
      if (resultado.requisitosFaltando && resultado.requisitosFaltando.length > 0) {
        this.erro = resultado.requisitosFaltando[0]; 
        this.notificacaoService.aviso(resultado.requisitosFaltando[0]); 
      } else {
        this.erro = 'Senha precisa ser forte'; 
        this.notificacaoService.exibirPadrao(MENSAGENS_PADRAO.SENHA_FRACA);
      }
      return;
    }

    // Emite dados
    this.confirmar.emit({
      senhaAtual: this.senhaAtual,
      novaSenha: this.novaSenha
    });

    this.limparCampos();
  }

  limparCampos() {
    this.senhaAtual = '';
    this.novaSenha = '';
    this.confirmacaoSenha = '';
    this.erro = '';
    this.mostrarSenhaAtual = false;
    this.mostrarNovaSenha = false;
    this.mostrarConfirmacao = false;
  }

  toggleMostrarSenha(campo: 'atual' | 'nova' | 'confirmacao') {
    if (campo === 'atual') this.mostrarSenhaAtual = !this.mostrarSenhaAtual;
    if (campo === 'nova') this.mostrarNovaSenha = !this.mostrarNovaSenha;
    if (campo === 'confirmacao') this.mostrarConfirmacao = !this.mostrarConfirmacao;
  }
}