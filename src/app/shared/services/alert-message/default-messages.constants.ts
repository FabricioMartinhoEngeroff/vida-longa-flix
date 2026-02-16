export interface DefaultMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  text: string;
}

export const DEFAULT_MESSAGES = {
  // ============================================================
  // SUCCESS (Verde) - Mensagens de sucesso em PT para usuário
  // ============================================================
  REGISTRATION_SUCCESS: {
    type: 'success' as const,
    title: 'Sucesso',
    text: 'Cadastro concluído com sucesso!'
  },
  
  LOGIN_SUCCESS: {
    type: 'success' as const,
    title: 'Sucesso',
    text: 'Login realizado com sucesso!'
  },
  
  PROFILE_UPDATED: {
    type: 'success' as const,
    title: 'Sucesso',
    text: 'Perfil atualizado com sucesso!'
  },
  
  PASSWORD_CHANGED: {
    type: 'success' as const,
    title: 'Sucesso',
    text: 'Senha alterada com sucesso!'
  },
  
  FAVORITE_ADDED: {
    type: 'success' as const,
    title: 'Sucesso',
    text: 'Receita adicionada aos favoritos!'
  },
  
  FAVORITE_REMOVED: {
    type: 'success' as const,
    title: 'Sucesso',
    text: 'Receita removida dos favoritos!'
  },

  PHOTO_UPDATED: {
    type: 'success' as const,
    title: 'Sucesso',
    text: 'Foto atualizada com sucesso!'
  },

  OPERATION_SUCCESS: {
    type: 'success' as const,
    title: 'Sucesso',
    text: 'Operação realizada com sucesso!'
  },

  PASSWORD_RESET: {
    type: 'success' as const,
    title: 'Sucesso',
    text: 'Senha redefinida com sucesso! Redirecionando...'
  },

  // ============================================================
  // WARNING (Amarelo) - Avisos em PT para usuário
  // ============================================================
  REQUIRED_FIELDS: {
    type: 'warning' as const,
    title: 'Atenção',
    text: 'Existem um ou mais campos obrigatórios que não foram preenchidos.'
  },
  
  INCOMPLETE_PROFILE: {
    type: 'warning' as const,
    title: 'Atenção',
    text: 'Complete seu perfil para acessar todos os recursos.'
  },
  
  INVALID_EMAIL: {
    type: 'warning' as const,
    title: 'Atenção',
    text: 'Por favor, use um email válido e profissional.'
  },
  
  WEAK_PASSWORD: {
    type: 'warning' as const,
    title: 'Atenção',
    text: 'A senha não atende aos requisitos de segurança.'
  },
  
  NO_PERMISSION: {
    type: 'warning' as const,
    title: 'Atenção',
    text: 'Você não possui permissão para acessar este recurso.'
  },

  INVALID_FILE_FORMAT: {
    type: 'warning' as const,
    title: 'Atenção',
    text: 'Por favor, selecione apenas imagens.'
  },

  FILE_TOO_LARGE: {
    type: 'warning' as const,
    title: 'Atenção',
    text: 'Imagem muito grande. Máximo 2MB.'
  },

  FIX_ERRORS: {
    type: 'warning' as const,
    title: 'Atenção',
    text: 'Corrija os erros antes de continuar.'
  },

  // ============================================================
  // ERROR (Vermelho) - Erros em PT para usuário
  // ============================================================
  GENERIC_ERROR: {
    type: 'error' as const,
    title: 'Erro',
    text: 'Erro ao processar sua solicitação. Tente novamente.'
  },
  
  LOGIN_ERROR: {
    type: 'error' as const,
    title: 'Erro',
    text: 'Email ou senha incorretos. Tente novamente.'
  },
  
  CONNECTION_ERROR: {
    type: 'error' as const,
    title: 'Erro',
    text: 'Erro de conexão. Verifique sua internet.'
  },
  
  SAVE_ERROR: {
    type: 'error' as const,
    title: 'Erro',
    text: 'Erro ao salvar as alterações. Tente novamente.'
  },
  
  SESSION_EXPIRED: {
    type: 'error' as const,
    title: 'Erro',
    text: 'Sua sessão expirou. Faça login novamente.'
  },

  INVALID_TOKEN: {
    type: 'error' as const,
    title: 'Erro',
    text: 'Link inválido ou expirado.'
  },

  ERROR_VALIDATING_TOKEN: {
    type: 'error' as const,
    title: 'Erro',
    text: 'Erro ao validar link. Tente novamente.'
  },

  PASSWORDS_DO_NOT_MATCH: {
    type: 'error' as const,
    title: 'Erro',
    text: 'As senhas digitadas não são iguais.'
  },

  ERROR_RESETTING_PASSWORD: {
    type: 'error' as const,
    title: 'Erro',
    text: 'Erro ao redefinir senha. Tente novamente.'
  },

  ERROR_SENDING_EMAIL: {
    type: 'error' as const,
    title: 'Erro',
    text: 'Erro ao enviar email. Tente novamente.'
  },

  ERROR_FETCHING_USER: {
    type: 'error' as const,
    title: 'Erro',
    text: 'Erro ao buscar usuário autenticado.'
  },

  // ============================================================
  // INFO (Azul) - Informações em PT para usuário
  // ============================================================
  RECOVERY_EMAIL_SENT: {
    type: 'info' as const,
    title: 'Informação',
    text: 'Email de recuperação enviado. Verifique sua caixa de entrada.'
  },
  
  UPLOAD_IN_PROGRESS: {
    type: 'info' as const,
    title: 'Informação',
    text: 'Upload em andamento. Aguarde a conclusão.'
  },
  
  PROCESSING: {
    type: 'info' as const,
    title: 'Informação',
    text: 'Processando sua solicitação. Aguarde...'
  },
  
  DATA_UPDATED: {
    type: 'info' as const,
    title: 'Informação',
    text: 'Os dados foram atualizados. Recarregue a página.'
  }
} as const;