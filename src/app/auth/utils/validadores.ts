import { errosValidacao } from './erros-validacao';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cpfRegex = /^\d{11}$/;
const phoneRegex = /^\d{10,11}$/;
const passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/;

export function validarEmail(email: string): string | null {
  if (!email) return errosValidacao.required;
  if (!emailRegex.test(email)) return errosValidacao.invalidEmail;
  return null;
}

export function validarCPF(cpf: string): string | null {
  if (!cpf) return errosValidacao.required;

  const numeros = cpf.replace(/\D/g, '');
  if (!cpfRegex.test(numeros)) return errosValidacao.invalidCPF;

  return null;
}

export function validarTelefone(telefone: string): string | null {
  if (!telefone) return errosValidacao.required;

  const numeros = telefone.replace(/\D/g, '');
  if (!phoneRegex.test(numeros)) return errosValidacao.invalidPhone;

  return null;
}

export function validarSenha(senha: string): string | null {
  if (!senha) return errosValidacao.required;
  if (senha.length < 8) return errosValidacao.passwordTooShort;
  if (!passwordRegex.test(senha)) return errosValidacao.invalidPassword;

  return null;
}

/**
 * Valida campos vazios em objetos aninhados.
 * Ex: endereco.rua
 */
export function validarCamposVazios(
  campos: Record<string, any>,
  chavePai: string = ''
): string | null {
  for (const [chave, valor] of Object.entries(campos)) {
    const chaveCompleta = chavePai ? `${chavePai}.${chave}` : chave;

    if (typeof valor === 'object' && valor !== null) {
      const erroAninhado = validarCamposVazios(valor, chaveCompleta);
      if (erroAninhado) return erroAninhado;
    } else {
      const texto = String(valor ?? '').trim();
      if (!texto) return `${chaveCompleta} - ${errosValidacao.required}`;
    }
  }

  return null;
}
