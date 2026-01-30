import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ModalConfirmacaoComponent } from '../modal-confirmacao/modal-confirmacao.component';
import { ModalMudarSenhaComponent } from '../modal-mudar-senha/modal-mudar-senha.component';


@Component({
  selector: 'app-menu-usuario',
  standalone: true,
  imports: [CommonModule, MatIconModule, ModalConfirmacaoComponent,ModalMudarSenhaComponent ],
  templateUrl: './menu-usuario.component.html',
  styleUrls: ['./menu-usuario.component.css']
})
export class MenuUsuarioComponent {
  menuAberto = false;
  modalSairAberta = false;
  arrastandoFoto = false; 
  modalMudarSenhaAberta = false; 
  mostrarMensagemSucesso = false; 
  
  
  // Dados do usuário (depois virá do backend)
  usuario = {
    nome: 'Fabricio Engeroff',
    email: 'fa.engeroff@gmail.com',
    foto: null as string | null 
  };

  constructor(private router: Router) {}

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

  // ✅ NOVO: Processar foto (drag ou click)
  processarFoto(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas imagens');
      return;
    }

    // Limitar tamanho (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Imagem muito grande. Máximo 2MB');
      return;
    }

    // Converter para base64
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.usuario.foto = e.target.result;
      console.log('✅ Foto atualizada');
      // TODO: Enviar para backend
      // this.http.post('/api/usuario/foto', { foto: this.usuario.foto }).subscribe();
    };
    reader.readAsDataURL(file);
  }

  // ✅ NOVO: Drag & Drop
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
    console.log('🧑 Ir para perfil');
    this.fecharMenu();
    // TODO: this.router.navigate(['/app/perfil']);
  }

  irParaConfiguracoes() {
    console.log('⚙️ Ir para configurações');
    this.fecharMenu();
    // TODO: this.router.navigate(['/app/configuracoes']);
  }

  sair() {
    this.modalSairAberta = true; 
    this.fecharMenu();
  }

  // ← ADICIONAR
  confirmarSaida() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    this.router.navigate(['/autorizacao']);
  }

  // ← ADICIONAR
  cancelarSaida() {
    this.modalSairAberta = false;
  }

  mudarSenha() {
  this.modalMudarSenhaAberta = true;
  this.fecharMenu();
}

fecharModalSenha() {
  this.modalMudarSenhaAberta = false;
}

confirmarMudancaSenha(dados: { senhaAtual: string; novaSenha: string }) {
  console.log('🔐 Mudar senha:', dados);
  // TODO: Enviar para backend
  this.modalMudarSenhaAberta = false;
  this.mostrarMensagemSucesso = true; 
  
  setTimeout(() => {
    this.mostrarMensagemSucesso = false;
  }, 3000);
}
}