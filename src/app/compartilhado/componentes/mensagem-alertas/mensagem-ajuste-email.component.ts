import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type TipoErroEmail = 'temporario' | 'suspeito' | 'invalido' | 'sugestao' | null;

interface ConfigErro {
  icone: string;
  cor: string;
  titulo: string;
  mensagem: string;
}

@Component({
  selector: 'app-mensagem-ajuste-email',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="mensagem-email" *ngIf="tipoErro" [class]="'tipo-' + tipoErro">
      <div class="header">
        <mat-icon>{{ configuracao.icone }}</mat-icon>
        <span class="titulo">{{ configuracao.titulo }}</span>
      </div>
      
      <p class="mensagem">{{ mensagemCustom || configuracao.mensagem }}</p>
      
      <div class="sugestoes" *ngIf="emailSugerido">
        <p class="label">Você quis dizer:</p>
        <button class="btn-sugestao" (click)="selecionarSugestao()">
          <mat-icon>edit</mat-icon>
          <span>{{ emailSugerido }}</span>
        </button>
      </div>

      <div class="acoes" *ngIf="mostrarAcoes">
        <button class="btn-secundario" (click)="dispensar()">
          Continuar mesmo assim
        </button>
      </div>
    </div>
  `,
  styles: [`
    .mensagem-email {
      margin-top: 8px;
      padding: 12px 16px;
      border-radius: 8px;
      border-left: 4px solid;
      background: #f9fafb;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .header mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .titulo {
      font-size: 14px;
      font-weight: 600;
    }

    .mensagem {
      margin: 0 0 12px 0;
      font-size: 13px;
      line-height: 1.5;
      color: #6b7280;
    }

    /* Tipos de erro */
    .tipo-temporario {
      border-left-color: #dc2626;
      background: #fef2f2;
    }

    .tipo-temporario .header {
      color: #dc2626;
    }

    .tipo-suspeito {
      border-left-color: #f59e0b;
      background: #fffbeb;
    }

    .tipo-suspeito .header {
      color: #f59e0b;
    }

    .tipo-invalido {
      border-left-color: #ef4444;
      background: #fef2f2;
    }

    .tipo-invalido .header {
      color: #ef4444;
    }

    .tipo-sugestao {
      border-left-color: #3b82f6;
      background: #eff6ff;
    }

    .tipo-sugestao .header {
      color: #3b82f6;
    }

    /* Sugestões */
    .sugestoes {
      margin-bottom: 12px;
    }

    .label {
      font-size: 12px;
      color: #6b7280;
      margin: 0 0 6px 0;
    }

    .btn-sugestao {
      display: flex;
      align-items: center;
      gap: 8px;
      
      width: 100%;
      padding: 8px 12px;
      
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 6px;
      
      font-size: 14px;
      color: #3b82f6;
      font-weight: 500;
      
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-sugestao:hover {
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .btn-sugestao mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Ações */
    .acoes {
      display: flex;
      gap: 8px;
    }

    .btn-secundario {
      padding: 6px 12px;
      background: transparent;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      
      font-size: 12px;
      color: #6b7280;
      font-weight: 500;
      
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-secundario:hover {
      background: #f3f4f6;
      border-color: #9ca3af;
    }

    @media (max-width: 768px) {
      .mensagem-email {
        padding: 10px 14px;
      }

      .titulo {
        font-size: 13px;
      }

      .mensagem {
        font-size: 12px;
      }
    }
  `]
})
export class MensagemAjusteEmailComponent {
  @Input() tipoErro: TipoErroEmail = null;
  @Input() mensagemCustom?: string;
  @Input() emailSugerido?: string;
  @Input() mostrarAcoes = false;
  @Input() dominioProblematico?: string;

  private readonly configuracoes: Record<Exclude<TipoErroEmail, null>, ConfigErro> = {
    temporario: {
      icone: 'block',
      cor: '#dc2626',
      titulo: 'Email temporário detectado',
      mensagem: 'Emails temporários ou descartáveis não são aceitos. Use um email pessoal ou profissional válido.'
    },
    suspeito: {
      icone: 'warning',
      cor: '#f59e0b',
      titulo: 'Email suspeito',
      mensagem: 'Este domínio de email não é reconhecido. Verifique se digitou corretamente.'
    },
    invalido: {
      icone: 'error',
      cor: '#ef4444',
      titulo: 'Email inválido',
      mensagem: 'O formato do email está incorreto ou o domínio não é válido.'
    },
    sugestao: {
      icone: 'info',
      cor: '#3b82f6',
      titulo: 'Verificar email',
      mensagem: 'Detectamos um possível erro de digitação no seu email.'
    }
  };

  get configuracao(): ConfigErro {
    return this.tipoErro ? this.configuracoes[this.tipoErro] : this.configuracoes.invalido;
  }

  selecionarSugestao() {
    // Emite evento para componente pai preencher o campo
    console.log('✏️ Sugestão selecionada:', this.emailSugerido);
  }

  dispensar() {
    // Emite evento para componente pai ocultar a mensagem
    console.log('✖️ Aviso dispensado');
  }
}