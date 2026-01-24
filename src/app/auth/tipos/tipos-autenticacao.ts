import { Endereco } from './endereco';

export interface DadosCadastroUsuario {
  nome: string;      
  email: string;
  senha: string;     
  cpf: string;
  telefone: string;
  endereco: Endereco;
}

export interface DadosLogin {
  email: string;
  password: string;
  manterConectado: boolean;
}

export interface LoginResponse {
  token: string;
  user: UsuarioAutenticado;
}

export interface UsuarioAutenticado {
  id: number;
  nome: string;
  email: string;
}