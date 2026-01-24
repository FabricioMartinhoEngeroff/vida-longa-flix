import { errosValidacao } from './erros-validacao';
import { calcularForcaSenha, ForcaSenha, CONFIGURACAO_SENHA } from './validador-senha-forte';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cpfRegex = /^\d{11}$/;
const phoneRegex = /^\d{10,11}$/;

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

/**
 * ✅ REFATORADO: Validação de senha forte
 * Usa o novo validador com requisitos médios
 */
export function validarSenha(senha: string): string | null {
  if (!senha) return errosValidacao.required;
  
  const resultado = calcularForcaSenha(senha);
  
  // Exige ao menos senha MÉDIA (configurável)
  if (resultado.forca < CONFIGURACAO_SENHA.nivelMinimoForca) {
    // Retorna primeiro requisito faltando
    if (resultado.requisitosFaltando.length > 0) {
      return resultado.requisitosFaltando[0];
    }
    return errosValidacao.senhaFraca;
  }

  return null;
}

/**
 * Valida campos vazios em objetos aninhados
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