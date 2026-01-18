import { Component } from '@angular/core';
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

  onPesquisar(valor: string) {
    console.log('Pesquisando:', valor);
  }

  abrirConfiguracoes() {
    console.log('Abrir configurações clicado!');
  }

  logout() {
  console.log("Logout clicado!");
}

}
