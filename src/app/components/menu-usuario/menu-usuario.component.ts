import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ModalConfirmacaoComponent } from '../modal-confirmacao/modal-confirmacao.component';
import { ModalMudarSenhaComponent } from '../modal-mudar-senha/modal-mudar-senha.component';
import { NotificacaoService } from '../../services/mensagem-alerta/mensagem-alerta.service';
import { UsuarioAutenticacaoService } from '../../auth/api/usuario-autenticacao.service';
import { ModalPerfilUsuarioComponent } from '../modal-perfil-usuario/modal-perfil-usuario.component';

@Component({
  selector: 'app-menu-usuario',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    ModalConfirmacaoComponent,
    ModalMudarSenhaComponent,
    ModalPerfilUsuarioComponent
  ],
  templateUrl: './menu-usuario.component.html',
  styleUrls: ['./menu-usuario.component.css']
})
export class MenuUsuarioComponent {
  menuAberto = false;
  modalSairAberta = false;
  arrastandoFoto = false; 
  modalMudarSenhaAberta = false;
  modalPerfilAberta = false;

  
  usuario = {
    nome: 'Fabricio Engeroff',
    email: 'fa.engeroff@gmail.com',
    foto: null as string | null 
  };

  constructor(
    private router: Router,
    private notificacaoService: NotificacaoService,
    private usuarioAuth: UsuarioAutenticacaoService
  ) {}

  toggleMenu() {
    this.menuAberto = !this.menuAberto;
  }

  fecharMenu() {
    this.menuAberto = false;
  }

  selecionarFoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        this.processarFoto(file);
      }
    };
    input.click();
  }

  processarFoto(file: File) {
    if (!file.type.startsWith('image/')) {
      this.notificacaoService.erro('Por favor, selecione apenas imagens');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.notificacaoService.aviso('Imagem muito grande. Máximo 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.usuario.foto = e.target.result;
      this.notificacaoService.sucesso('Foto atualizada com sucesso!');
      // TODO: Enviar para backend
    };
    reader.readAsDataURL(file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.arrastandoFoto = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.arrastandoFoto = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.arrastandoFoto = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processarFoto(files[0]);
    }
  }

  irParaPerfil() {
  this.modalPerfilAberta = true;  
  this.fecharMenu();
}

fecharModalPerfil() {
  this.modalPerfilAberta = false;
}

salvarPerfil(dados: any) {
  console.log('💾 Salvar perfil:', dados);
  // TODO: Enviar para backend
  this.modalPerfilAberta = false;
  this.notificacaoService.sucesso('Perfil atualizado com sucesso!');
}

abrirMudarSenhaDePerfil() {
  this.modalPerfilAberta = false;
  this.modalMudarSenhaAberta = true;
}

  irParaConfiguracoes() {
    console.log('⚙️ Ir para configurações');
    this.fecharMenu();
  }

  sair() {
    this.modalSairAberta = true; 
    this.fecharMenu();
  }

confirmarSaida() {
  this.usuarioAuth.sair();  // ← DRY, usa o service
}

  cancelarSaida() {
    this.modalSairAberta = false;
  }

  fecharModalSenha() {
    this.modalMudarSenhaAberta = false;
  }

  confirmarMudancaSenha(dados: { senhaAtual: string; novaSenha: string }) {
    console.log('🔐 Mudar senha:', dados);
    
    // TODO: Quando tiver backend, será assim:
    // this.authService.mudarSenha(dados).subscribe({
    //   next: () => {
    //     this.notificacaoService.sucesso('Senha alterada com sucesso!');
    //   },
    //   error: (erro) => {
    //     this.notificacaoService.erro(erro.message || 'Erro ao alterar senha');
    //   }
    // });
    
    // Por enquanto (simulando sucesso):
    this.modalMudarSenhaAberta = false;
    this.fecharMenu();
    this.notificacaoService.sucesso('Senha alterada com sucesso!');
  }
}