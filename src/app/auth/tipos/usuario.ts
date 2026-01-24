export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: {
    rua: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
}
