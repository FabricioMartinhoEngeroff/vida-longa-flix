export interface EnderecoCadastro {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface DadosCadastroUsuario {
  name: string;
  email: string;
  password: string;
  cpf: string;
  telefone: string;
  endereco: EnderecoCadastro;
}

export interface LoginResponse {
  token: string;
}