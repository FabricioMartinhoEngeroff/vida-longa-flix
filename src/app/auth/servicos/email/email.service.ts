import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface EmailBoasVindas {
  nome: string;
  email: string;
}

export interface EmailRecuperacaoSenha {
  email: string;
  token: string;
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
    console.log('📧 Enviando email de boas-vindas para:', dados.email);
    
    // TODO: Quando tiver backend
    // return this.http.post(`${this.apiUrl}/email/boas-vindas`, dados).toPromise();

    // Simula delay do backend
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('✅ Email de boas-vindas enviado:', {
      para: dados.email,
      nome: dados.nome,
      assunto: 'Bem-vindo(a) ao Vida Longa Flix!',
      template: this.getTemplateBoasVindas(dados)
    });
  }

  /**
   * Envia email de recuperação de senha
   */
  async enviarRecuperacaoSenha(email: string): Promise<void> {
    console.log('📧 Enviando email de recuperação para:', email);
    
    // Gera token simulado (no backend será real)
    const token = this.gerarTokenSimulado();
    
    // TODO: Quando tiver backend
    // return this.http.post(`${this.apiUrl}/email/recuperar-senha`, { email }).toPromise();

    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('✅ Email de recuperação enviado:', {
      para: email,
      assunto: 'Recuperação de Senha - Vida Longa Flix',
      link: `${window.location.origin}/redefinir-senha?token=${token}`,
      template: this.getTemplateRecuperacao(email, token)
    });
  }

  /**
   * Template HTML do email de boas-vindas
   */
  private getTemplateBoasVindas(dados: EmailBoasVindas): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7da873; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #6a0dad; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Vida Longa Flix Saúde</h1>
          </div>
          <div class="content">
            <h2>Bem-vindo(a), ${dados.nome}! 🎉</h2>
            <p>Estamos muito felizes em ter você na nossa comunidade!</p>
            <p>O Vida Longa Flix é a sua plataforma de receitas saudáveis e dicas de bem-estar.</p>
            
            <p><strong>O que você pode fazer agora:</strong></p>
            <ul>
              <li>Explorar receitas deliciosas e nutritivas</li>
              <li>Salvar suas receitas favoritas</li>
              <li>Criar listas personalizadas</li>
              <li>Compartilhar com amigos e família</li>
            </ul>

            <a href="${window.location.origin}/app" class="button">Começar a explorar</a>

            <p>Se tiver dúvidas, estamos aqui para ajudar!</p>
            <p>Equipe Vida Longa Flix 💚</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Vida Longa Flix. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template HTML do email de recuperação
   */
  private getTemplateRecuperacao(email: string, token: string): string {
    const link = `${window.location.origin}/redefinir-senha?token=${token}`;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6a0dad; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #6a0dad; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Recuperação de Senha</h1>
          </div>
          <div class="content">
            <h2>Olá!</h2>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta (<strong>${email}</strong>).</p>
            
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            
            <a href="${link}" class="button">Redefinir Senha</a>
            
            <p>Ou copie e cole este link no navegador:</p>
            <p style="word-break: break-all; color: #6a0dad;">${link}</p>

            <div class="warning">
              <strong>⚠️ Importante:</strong> Este link expira em 1 hora. Se você não solicitou esta alteração, ignore este email.
            </div>

            <p>Equipe Vida Longa Flix</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Vida Longa Flix. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Gera token simulado (no backend será JWT real)
   */
  private gerarTokenSimulado(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}