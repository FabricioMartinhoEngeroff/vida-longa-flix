import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Níveis de força da senha
 */
export enum ForcaSenha {
  MUITO_FRACA = 0,
  FRACA = 1,
  MEDIA = 2,
  FORTE = 3,
  MUITO_FORTE = 4
}

/**
 * Configuração de requisitos de senha
 * PADRÃO MÉDIO: 8 caracteres + maiúscula + minúscula + número + especial
 */
export const CONFIGURACAO_SENHA = {
  tamanhoMinimo: 8,
  exigeMaiuscula: true,
  exigeMinuscula: true,
  exigeNumero: true,
  exigeEspecial: true,
  nivelMinimoForca: ForcaSenha.MEDIA
};

/**
 * Requisitos individuais da senha
 */
export interface RequisitosSenha {
  tamanhoMinimo: boolean;
  temLetraMaiuscula: boolean;
  temLetraMinuscula: boolean;
  temNumero: boolean;
  temCaractereEspecial: boolean;
}

/**
 * Resultado completo da análise de senha
 */
export interface ResultadoForcaSenha {
  forca: ForcaSenha;
  porcentagem: number;
  mensagem: string;
  cor: string;
  requisitos: RequisitosSenha;
  requisitosFaltando: string[];
}

/**
 * Calcula a força da senha e retorna análise completa
 */
export function calcularForcaSenha(senha: string): ResultadoForcaSenha {
  if (!senha) {
    return {
      forca: ForcaSenha.MUITO_FRACA,
      porcentagem: 0,
      mensagem: 'Digite uma senha',
      cor: '#9ca3af',
      requisitos: {
        tamanhoMinimo: false,
        temLetraMaiuscula: false,
        temLetraMinuscula: false,
        temNumero: false,
        temCaractereEspecial: false
      },
      requisitosFaltando: []
    };
  }

  // Verifica requisitos
  const requisitos: RequisitosSenha = {
    tamanhoMinimo: senha.length >= CONFIGURACAO_SENHA.tamanhoMinimo,
    temLetraMaiuscula: /[A-Z]/.test(senha),
    temLetraMinuscula: /[a-z]/.test(senha),
    temNumero: /[0-9]/.test(senha),
    temCaractereEspecial: /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/'`~;]/.test(senha)
  };

  // Calcula pontuação
  let pontos = 0;
  if (requisitos.tamanhoMinimo) pontos++;
  if (requisitos.temLetraMaiuscula) pontos++;
  if (requisitos.temLetraMinuscula) pontos++;
  if (requisitos.temNumero) pontos++;
  if (requisitos.temCaractereEspecial) pontos++;

  // Bônus por tamanho extra
  if (senha.length >= 12) pontos += 0.5;
  if (senha.length >= 16) pontos += 0.5;

  // Determina força e aparência
  let forca: ForcaSenha;
  let mensagem: string;
  let porcentagem: number;
  let cor: string;

  if (pontos < 2) {
    forca = ForcaSenha.MUITO_FRACA;
    mensagem = 'Muito fraca';
    porcentagem = 20;
    cor = '#dc2626';
  } else if (pontos < 3) {
    forca = ForcaSenha.FRACA;
    mensagem = 'Fraca';
    porcentagem = 40;
    cor = '#f59e0b';
  } else if (pontos < 4) {
    forca = ForcaSenha.MEDIA;
    mensagem = 'Média';
    porcentagem = 60;
    cor = '#eab308';
  } else if (pontos < 5) {
    forca = ForcaSenha.FORTE;
    mensagem = 'Forte';
    porcentagem = 80;
    cor = '#10b981';
  } else {
    forca = ForcaSenha.MUITO_FORTE;
    mensagem = 'Muito forte';
    porcentagem = 100;
    cor = '#059669';
  }

  // Lista requisitos faltando
  const requisitosFaltando: string[] = [];
  if (!requisitos.tamanhoMinimo) {
    requisitosFaltando.push(`Mínimo ${CONFIGURACAO_SENHA.tamanhoMinimo} caracteres`);
  }
  if (CONFIGURACAO_SENHA.exigeMaiuscula && !requisitos.temLetraMaiuscula) {
    requisitosFaltando.push('Uma letra maiúscula (A-Z)');
  }
  if (CONFIGURACAO_SENHA.exigeMinuscula && !requisitos.temLetraMinuscula) {
    requisitosFaltando.push('Uma letra minúscula (a-z)');
  }
  if (CONFIGURACAO_SENHA.exigeNumero && !requisitos.temNumero) {
    requisitosFaltando.push('Um número (0-9)');
  }
  if (CONFIGURACAO_SENHA.exigeEspecial && !requisitos.temCaractereEspecial) {
    requisitosFaltando.push('Um caractere especial (!@#$%...)');
  }

  return { forca, porcentagem, mensagem, cor, requisitos, requisitosFaltando };
}

/**
 * Validador Angular para senha forte
 * Usa configuração MÉDIA por padrão
 */
export function validadorSenhaForte(
  nivelMinimo: ForcaSenha = CONFIGURACAO_SENHA.nivelMinimoForca
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const senha = control.value;
    
    if (!senha) {
      return null; // Deixa o Validators.required cuidar
    }

    const resultado = calcularForcaSenha(senha);
    
    if (resultado.forca < nivelMinimo) {
      return { 
        senhaFraca: { 
          forca: resultado.forca,
          mensagem: resultado.mensagem,
          requisitos: resultado.requisitos,
          requisitosFaltando: resultado.requisitosFaltando
        } 
      };
    }

    return null;
  };
}