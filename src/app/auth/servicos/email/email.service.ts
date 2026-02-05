import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../src/environments/environment'; // ✅ ADICIONAR ESTA LINHA

import { gerarEmailBoasVindas } from './templates/email-boas-vindas';
import { gerarEmailRecuperacaoSenha } from './templates/email-recuperacao-senha';

// ... resto do código

export interface EmailBoasVindas {
  nome: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  /**
   * Envia email de boas-vindas após cadastro
   */
  async enviarBoasVindas(dados: EmailBoasVindas): Promise<void> {
    console.log('%c📧 ENVIANDO EMAIL DE BOAS-VINDAS', 'background: #7da873; color: white; padding: 8px; font-weight: bold; border-radius: 4px;');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Para:', dados.email);
    console.log('✉️  Nome:', dados.nome);
    console.log('📝 Assunto:', 'Bem-vindo(a) ao Vida Longa Flix!');
    console.log('⏰ Data:', new Date().toLocaleString('pt-BR'));
    
    // TODO: Quando tiver backend
    // return this.http.post(`${this.apiUrl}/email/boas-vindas`, dados).toPromise();

    // Simula delay do backend
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('%c✅ EMAIL DE BOAS-VINDAS ENVIADO COM SUCESSO!', 'background: #059669; color: white; padding: 8px; font-weight: bold; border-radius: 4px;');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📄 Preview do template:', {
      para: dados.email,
      nome: dados.nome,
      conteudo: 'Email HTML com boas-vindas, botão de ação e instruções'
    });
    console.log('🔗 Link no email:', `${window.location.origin}/app`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Envia email de recuperação de senha
   */
  async enviarRecuperacaoSenha(email: string): Promise<void> {
    console.log('%c📧 ENVIANDO EMAIL DE RECUPERAÇÃO DE SENHA', 'background: #6a0dad; color: white; padding: 8px; font-weight: bold; border-radius: 4px;');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Para:', email);
    console.log('📝 Assunto:', 'Recuperação de Senha - Vida Longa Flix');
    console.log('⏰ Data:', new Date().toLocaleString('pt-BR'));
    
    // Gera token simulado
    const token = this.gerarTokenSimulado();
    const link = `${window.location.origin}/redefinir-senha?token=${token}`;
    
    // TODO: Quando tiver backend
    // return this.http.post(`${this.apiUrl}/email/recuperar-senha`, { email }).toPromise();

    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('%c✅ EMAIL DE RECUPERAÇÃO ENVIADO COM SUCESSO!', 'background: #059669; color: white; padding: 8px; font-weight: bold; border-radius: 4px;');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Token gerado:', token);
    console.log('🔗 Link de recuperação:', link);
    console.log('⏳ Validade:', '1 hora');
    console.log('📄 Preview do template:', {
      para: email,
      conteudo: 'Email HTML com botão para redefinir senha e aviso de segurança'
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('%c👆 COPIE O LINK ACIMA PARA TESTAR A REDEFINIÇÃO', 'background: #f59e0b; color: white; padding: 8px; font-weight: bold; border-radius: 4px;');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Gera token simulado (no backend será JWT real)
   */
  private gerarTokenSimulado(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}