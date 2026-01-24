
export function removerMascara(valor: string): string {
  if (!valor) return '';
  return valor.replace(/\D/g, '');
}

/**
 * Máscara de CPF: 000.000.000-00
 * @param valor - CPF sem formatação
 * @returns CPF formatado
 * @example "12345678900" → "123.456.789-00"
 */
export function aplicarMascaraCPF(valor: string): string {
  const numeros = removerMascara(valor);
  
  return numeros
    .substring(0, 11)  // Limita a 11 dígitos
    .replace(/(\d{3})(\d)/, '$1.$2')      // 123.
    .replace(/(\d{3})(\d)/, '$1.$2')      // 123.456.
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // 123.456.789-00
}

/**
 * Máscara de CNPJ: 00.000.000/0000-00
 * @param valor - CNPJ sem formatação
 * @returns CNPJ formatado
 * @example "12345678000190" → "12.345.678/0001-90"
 */
export function aplicarMascaraCNPJ(valor: string): string {
  const numeros = removerMascara(valor);
  
  return numeros
    .substring(0, 14)  // Limita a 14 dígitos
    .replace(/(\d{2})(\d)/, '$1.$2')        // 12.
    .replace(/(\d{3})(\d)/, '$1.$2')        // 12.345.
    .replace(/(\d{3})(\d)/, '$1/$2')        // 12.345.678/
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2'); // 12.345.678/0001-90
}

/**
 * Máscara de Telefone Fixo: (00) 0000-0000
 * @param valor - Telefone sem formatação
 * @returns Telefone formatado
 * @example "1133334444" → "(11) 3333-4444"
 */
export function aplicarMascaraTelefone(valor: string): string {
  const numeros = removerMascara(valor);
  
  return numeros
    .substring(0, 10)  // Limita a 10 dígitos
    .replace(/(\d{2})(\d)/, '($1) $2')   // (11) 
    .replace(/(\d{4})(\d)/, '$1-$2');    // (11) 3333-4444
}

/**
 * Máscara de Celular: (00) 00000-0000
 * @param valor - Celular sem formatação
 * @returns Celular formatado
 * @example "11987654321" → "(11) 98765-4321"
 */
export function aplicarMascaraCelular(valor: string): string {
  const numeros = removerMascara(valor);
  
  return numeros
    .substring(0, 11)  // Limita a 11 dígitos
    .replace(/(\d{2})(\d)/, '($1) $2')   // (11) 
    .replace(/(\d{5})(\d)/, '$1-$2');    // (11) 98765-4321
}

/**
 * Máscara de Telefone Automática
 * Detecta se é celular (11 dígitos) ou fixo (10 dígitos)
 * @param valor - Telefone sem formatação
 * @returns Telefone formatado
 */
export function aplicarMascaraTelefoneAuto(valor: string): string {
  const numeros = removerMascara(valor);
  
  if (numeros.length <= 10) {
    return aplicarMascaraTelefone(valor);
  } else {
    return aplicarMascaraCelular(valor);
  }
}

/**
 * Máscara de CEP: 00000-000
 * @param valor - CEP sem formatação
 * @returns CEP formatado
 * @example "12345678" → "12345-678"
 */
export function aplicarMascaraCEP(valor: string): string {
  const numeros = removerMascara(valor);
  
  return numeros
    .substring(0, 8)  // Limita a 8 dígitos
    .replace(/(\d{5})(\d)/, '$1-$2');  // 12345-678
}

/**
 * Máscara de RG: 00.000.000-0
 * @param valor - RG sem formatação
 * @returns RG formatado
 * @example "123456789" → "12.345.678-9"
 */
export function aplicarMascaraRG(valor: string): string {
  const numeros = removerMascara(valor);
  
  return numeros
    .substring(0, 9)  // Limita a 9 dígitos
    .replace(/(\d{2})(\d)/, '$1.$2')     // 12.
    .replace(/(\d{3})(\d)/, '$1.$2')     // 12.345.
    .replace(/(\d{3})(\d)/, '$1-$2');    // 12.345.678-9
}

/**
 * Máscara de Data: 00/00/0000
 * @param valor - Data sem formatação
 * @returns Data formatada
 * @example "01122025" → "01/12/2025"
 */
export function aplicarMascaraData(valor: string): string {
  const numeros = removerMascara(valor);
  
  return numeros
    .substring(0, 8)  // Limita a 8 dígitos
    .replace(/(\d{2})(\d)/, '$1/$2')     // 01/
    .replace(/(\d{2})(\d)/, '$1/$2');    // 01/12/2025
}