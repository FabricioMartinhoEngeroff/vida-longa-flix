import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CampoTextoComponent } from '../campo-texto/campo-texto.component';
import { TituloComponent } from '../titulo/titulo.component';

@Component({
  selector: 'app-cabecalho',
  templateUrl: './cabecalho.component.html',
  styleUrls: ['./cabecalho.component.css'],
  standalone: true,
  imports: [CampoTextoComponent, TituloComponent],
})
export class CabecalhoComponent {
  private router = inject(Router);

  onPesquisar(valor: string) {
    console.log('Pesquisando:', valor);
  }

  abrirConfiguracoes() {
    console.log('Abrir configurações clicado!');
  }

  logout() {
  // 1. Limpa tokens
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  
  // 2. Redireciona para autorizacao (com painel verde)
  this.router.navigate(['/autorizacao']); // ← MUDAR AQUI
  
  console.log('✅ Logout realizado');
}
}