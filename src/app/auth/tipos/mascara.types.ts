
export type TipoMascara = 
  | 'cpf' 
  | 'cnpj' 
  | 'telefone' 
  | 'celular'
  | 'cep' 
  | 'rg' 
  | 'data';

/**
 * Configuração de máscara para cada campo
 */
export interface ConfiguracaoMascara {
  /** Tipo de máscara */
  tipo: TipoMascara;
  
  /** Tamanho máximo com máscara aplicada */
  tamanhoMaximo: number;
  
  /** Placeholder sugerido */
  placeholder?: string;
  
  /** Mostra contador de caracteres */
  mostrarContador?: boolean;
}

/**
 * Configurações pré-definidas para cada tipo de máscara
 */
export const CONFIGURACOES_MASCARA: Record<TipoMascara, ConfiguracaoMascara> = {
  cpf: {
    tipo: 'cpf',
    tamanhoMaximo: 14,
    placeholder: '000.000.000-00',
    mostrarContador: false
  },
  cnpj: {
    tipo: 'cnpj',
    tamanhoMaximo: 18,
    placeholder: '00.000.000/0000-00',
    mostrarContador: false
  },
  telefone: {
    tipo: 'telefone',
    tamanhoMaximo: 14,
    placeholder: '(00) 0000-0000',
    mostrarContador: false
  },
  celular: {
    tipo: 'celular',
    tamanhoMaximo: 15,
    placeholder: '(00) 00000-0000',
    mostrarContador: false
  },
  cep: {
    tipo: 'cep',
    tamanhoMaximo: 9,
    placeholder: '00000-000',
    mostrarContador: false
  },
  rg: {
    tipo: 'rg',
    tamanhoMaximo: 12,
    placeholder: '00.000.000-0',
    mostrarContador: false
  },
  data: {
    tipo: 'data',
    tamanhoMaximo: 10,
    placeholder: '00/00/0000',
    mostrarContador: false
  }
};