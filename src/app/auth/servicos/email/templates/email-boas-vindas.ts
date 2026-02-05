export interface DadosBoasVindas {
  nome: string;
  email: string;
}

export function gerarEmailBoasVindas(dados: DadosBoasVindas): string {
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