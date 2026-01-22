import { Endereco } from './endereco';

export interface DadosFormulario {
  email: string;
  senha: string;
  nome: string;
  cpf: string;
  telefone: string;
  endereco: Endereco;
}
