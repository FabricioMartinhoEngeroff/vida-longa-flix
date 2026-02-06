import { FormControl } from '@angular/forms';

export type TipoMascara = 
  | 'cpf' 
  | 'cnpj' 
  | 'telefone' 
  | 'celular'
  | 'cep' 
  | 'rg' 
  | 'data';

export interface ConfiguracaoMascara {
  tipo: TipoMascara;
  tamanhoMaximo: number;
  placeholder?: string;
  mostrarContador?: boolean;
}


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
    tamanhoMaximo: 15, 
    placeholder: '(00) 00000-0000',
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


export type LoginForm = {
  email: FormControl<string>;
  password: FormControl<string>;
  manterConectado: FormControl<boolean>;
};

export type RegistroForm = {
  nome: FormControl<string>;
  email: FormControl<string>;
  senha: FormControl<string>;
};

export type PerfilForm = {
  nome: FormControl<string>;
  email: FormControl<string>;
  cpf: FormControl<string>;
  telefone: FormControl<string>;
  endereco: {
    rua: FormControl<string>;
    numero: FormControl<string>;
    bairro: FormControl<string>;
    cidade: FormControl<string>;
    estado: FormControl<string>;
    cep: FormControl<string>;
  };
};

export type MudarSenhaForm = {
  senhaAtual: FormControl<string>;
  novaSenha: FormControl<string>;
};

export type TipoErroEmail = 'temporario' | 'suspeito' | 'invalido' | 'sugestao' | null;

export interface ConfigErroEmail {
  icone: string;
  cor: string;
  titulo: string;
  mensagem: string;
}

export function validarFormatoCPF(cpf: string): boolean {
  const somenteNumeros = cpf.replace(/\D/g, '');
  return somenteNumeros.length === 11;
}

export function validarFormatoTelefone(telefone: string): boolean {
  const somenteNumeros = telefone.replace(/\D/g, '');
  return somenteNumeros.length === 10 || somenteNumeros.length === 11;
}

export function validarFormatoCEP(cep: string): boolean {
  const somenteNumeros = cep.replace(/\D/g, '');
  return somenteNumeros.length === 8;
}

