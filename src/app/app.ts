import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { MensagemSucessoComponent } from './compartilhado/componentes/mensagem-alertas/mensagem-sucesso.component';
import { MensagemErroComponent } from './compartilhado/componentes/mensagem-alertas/mensagem-erro.component';
import { MensagemAvisoComponent } from './compartilhado/componentes/mensagem-alertas/mensagem-aviso.component';
import { NotificacaoService } from './compartilhado/servicos/mensagem-alerta/mensagem-alerta.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MensagemSucessoComponent,
    MensagemErroComponent,
    MensagemAvisoComponent
  ],
  templateUrl: './app.html',  // ← MUDE de template inline para templateUrl
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;

  constructor(private notificacaoService: NotificacaoService) {}

  ngOnInit() {
    // Só precisa subscrever (componentes se auto-gerenciam)
    this.subscription = this.notificacaoService.notificacao$.subscribe();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}