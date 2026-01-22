export interface ErrosFormulario {
  nome: string | null;
  email: string | null;
  senha: string | null;
  cpf: string | null;
  telefone: string | null;
  endereco: {
    rua: string | null;
    bairro: string | null;
    cidade: string | null;
    estado: string | null;
    cep: string | null;
  };
}
