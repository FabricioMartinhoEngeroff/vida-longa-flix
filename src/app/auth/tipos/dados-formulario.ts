import { Endereco } from './endereco';

export interface DadosFormulario {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  telefone: string;
  endereco: Endereco;
}