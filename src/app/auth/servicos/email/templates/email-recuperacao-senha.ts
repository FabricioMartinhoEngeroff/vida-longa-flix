export interface DadosRecuperacaoSenha {
  email: string;
  token: string;
}

export function gerarEmailRecuperacaoSenha(dados: DadosRecuperacaoSenha): string {
  const link = `${window.location.origin}/redefinir-senha?token=${dados.token}`;
  
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
          <p>Recebemos uma solicitação para redefinir a senha da sua conta (<strong>${dados.email}</strong>).</p>
          
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