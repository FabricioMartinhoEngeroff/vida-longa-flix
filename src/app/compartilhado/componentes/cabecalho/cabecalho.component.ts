import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CampoTextoComponent } from '../campo-texto/campo-texto.component';
import { TituloComponent } from '../titulo/titulo.component';
import { NotificacoesComponent } from '../notificações/notificacoes.component';
import { MenuUsuarioComponent } from '../menu-usuario/menu-usuario.component';
import { BotaoSairComponent } from '../botao-sair/botao-sair.component';

@Component({
  selector: 'app-cabecalho',
  templateUrl: './cabecalho.component.html',
  styleUrls: ['./cabecalho.component.css'],
  standalone: true,
  imports: [CampoTextoComponent, TituloComponent, NotificacoesComponent, MenuUsuarioComponent, BotaoSairComponent ],
})
export class CabecalhoComponent {
  private router = inject(Router);

  onPesquisar(valor: string) {
    console.log('Pesquisando:', valor);
  }

  abrirConfiguracoes() {
    console.log('Abrir configurações clicado!');
  }
  
}