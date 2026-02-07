
export interface MensagemPadrao {
  tipo: 'sucesso' | 'erro' | 'aviso' | 'info';
  titulo: string;
  texto: string;
}

export const MENSAGENS_PADRAO = {
  // ============================================================
  // SUCESSO (Verde)
  // ============================================================
  CADASTRO_SUCESSO: {
    tipo: 'sucesso' as const,
    titulo: 'Sucesso',
    texto: 'Cadastro concluído com sucesso!'
  },
  
  LOGIN_SUCESSO: {
    tipo: 'sucesso' as const,
    titulo: 'Sucesso',
    texto: 'Login realizado com sucesso!'
  },
  
  PERFIL_ATUALIZADO: {
    tipo: 'sucesso' as const,
    titulo: 'Sucesso',
    texto: 'Perfil atualizado com sucesso!'
  },
  
  SENHA_ALTERADA: {
    tipo: 'sucesso' as const,
    titulo: 'Sucesso',
    texto: 'Senha alterada com sucesso!'
  },
  
  FAVORITO_ADICIONADO: {
    tipo: 'sucesso' as const,
    titulo: 'Sucesso',
    texto: 'Receita adicionada aos favoritos!'
  },
  
  FAVORITO_REMOVIDO: {
    tipo: 'sucesso' as const,
    titulo: 'Sucesso',
    texto: 'Receita removida dos favoritos!'
  },

  FOTO_ATUALIZADA: {
  tipo: 'sucesso' as const,
  titulo: 'Sucesso',
  texto: 'Foto atualizada com sucesso!'
},

OPERACAO_SUCESSO: {
  tipo: 'sucesso' as const,
  titulo: 'Sucesso',
  texto: 'Operação realizada com sucesso!'
},

SENHA_REDEFINIDA: {
  tipo: 'sucesso' as const,
  titulo: 'Sucesso',
  texto: 'Senha redefinida com sucesso! Redirecionando...'
},

  // ============================================================
  // AVISO (Amarelo)
  // ============================================================
  CAMPOS_OBRIGATORIOS: {
    tipo: 'aviso' as const,
    titulo: 'Atenção',
    texto: 'Existem um ou mais campos obrigatórios que não foram preenchidos.'
  },
  
  PERFIL_INCOMPLETO: {
    tipo: 'aviso' as const,
    titulo: 'Atenção',
    texto: 'Complete seu perfil para acessar todos os recursos.'
  },
  
  EMAIL_INVALIDO: {
    tipo: 'aviso' as const,
    titulo: 'Atenção',
    texto: 'Por favor, use um email válido e profissional.'
  },
  
  SENHA_FRACA: {
    tipo: 'aviso' as const,
    titulo: 'Atenção',
    texto: 'A senha não atende aos requisitos de segurança.'
  },
  
  SEM_PERMISSAO: {
    tipo: 'aviso' as const,
    titulo: 'Atenção',
    texto: 'Você não possui permissão para acessar este recurso.'
  },

  FORMATO_ARQUIVO_INVALIDO: {
  tipo: 'aviso' as const,
  titulo: 'Atenção',
  texto: 'Por favor, selecione apenas imagens.'
},

ARQUIVO_GRANDE_DEMAIS: {
  tipo: 'aviso' as const,
  titulo: 'Atenção',
  texto: 'Imagem muito grande. Máximo 2MB.'
},

CORRIJA_ERROS: {
  tipo: 'aviso' as const,
  titulo: 'Atenção',
  texto: 'Corrija os erros antes de continuar.'
},

  // ============================================================
  // ERRO (Vermelho)
  // ============================================================
  ERRO_GENERICO: {
    tipo: 'erro' as const,
    titulo: 'Erro',
    texto: 'Erro ao processar sua solicitação. Tente novamente.'
  },
  
  ERRO_LOGIN: {
    tipo: 'erro' as const,
    titulo: 'Erro',
    texto: 'Email ou senha incorretos. Tente novamente.'
  },
  
  ERRO_CONEXAO: {
    tipo: 'erro' as const,
    titulo: 'Erro',
    texto: 'Erro de conexão. Verifique sua internet.'
  },
  
  ERRO_SALVAR: {
    tipo: 'erro' as const,
    titulo: 'Erro',
    texto: 'Erro ao salvar as alterações. Tente novamente.'
  },
  
  SESSAO_EXPIRADA: {
    tipo: 'erro' as const,
    titulo: 'Erro',
    texto: 'Sua sessão expirou. Faça login novamente.'
  },

  TOKEN_INVALIDO: {
  tipo: 'erro' as const,
  titulo: 'Erro',
  texto: 'Link inválido ou expirado.'
},

ERRO_VALIDAR_TOKEN: {
  tipo: 'erro' as const,
  titulo: 'Erro',
  texto: 'Erro ao validar link. Tente novamente.'
},

SENHAS_NAO_COINCIDEM: {
  tipo: 'erro' as const,
  titulo: 'Erro',
  texto: 'As senhas digitadas não são iguais.'
},

ERRO_REDEFINIR_SENHA: {
  tipo: 'erro' as const,
  titulo: 'Erro',
  texto: 'Erro ao redefinir senha. Tente novamente.'
},

// === Recuperação de Senha ===
ERRO_ENVIAR_EMAIL: {
  tipo: 'erro' as const,
  titulo: 'Erro',
  texto: 'Erro ao enviar email. Tente novamente.'
},

ERRO_BUSCAR_USUARIO: {
  tipo: 'erro' as const,
  titulo: 'Erro',
  texto: 'Erro ao buscar usuário autenticado.'
},

  // ============================================================
  // INFORMAÇÃO (Azul)
  // ============================================================
  EMAIL_RECUPERACAO_ENVIADO: {
    tipo: 'info' as const,
    titulo: 'Informação',
    texto: 'Email de recuperação enviado. Verifique sua caixa de entrada.'
  },
  
  UPLOAD_ANDAMENTO: {
    tipo: 'info' as const,
    titulo: 'Informação',
    texto: 'Upload em andamento. Aguarde a conclusão.'
  },
  
  PROCESSANDO: {
    tipo: 'info' as const,
    titulo: 'Informação',
    texto: 'Processando sua solicitação. Aguarde...'
  },
  
  DADOS_ATUALIZADOS: {
    tipo: 'info' as const,
    titulo: 'Informação',
    texto: 'Os dados foram atualizados. Recarregue a página.'
  }
} as const;