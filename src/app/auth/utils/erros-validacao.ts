export const errosValidacao = {
  required: 'Este campo é obrigatório.',
  invalidEmail: 'Email deve ser válido.',
  emailExists: 'Este e-mail já está cadastrado.',
  
  invalidPassword: 'A senha não atende aos requisitos de segurança.',
  passwordTooShort: 'Senha deve ter pelo menos 8 caracteres.',
  senhaFraca: 'Senha fraca. Verifique os requisitos abaixo.',
  senhaNaoContemMaiuscula: 'Adicione ao menos uma letra maiúscula (A-Z).',
  senhaNaoContemMinuscula: 'Adicione ao menos uma letra minúscula (a-z).',
  senhaNaoContemNumero: 'Adicione ao menos um número (0-9).',
  senhaNaoContemEspecial: 'Adicione ao menos um caractere especial (!@#$%...).',
  
  // Outros
  invalidCPF: 'CPF deve estar no formato XXX.XXX.XXX-XX.',
  invalidPhone: 'Telefone deve estar no formato (XX) XXXXX-XXXX.',
  invalidCEP: 'O CEP informado não é válido.',
  invalidState: 'O estado informado não existe.',
  invalidCity: 'A cidade informada não existe.',
  emptyFields: 'Todos os campos devem ser preenchidos.',
  passwordMismatch: 'As senhas não coincidem.',
} as const;

export type ChaveErroValidacao = keyof typeof errosValidacao;