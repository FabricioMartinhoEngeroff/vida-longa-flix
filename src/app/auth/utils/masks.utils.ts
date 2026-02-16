export function removeMask(value: string): string {
  if (!value) return '';
  return value.replace(/\D/g, '');
}

export function applyCPFMask(value: string): string {
  const numbers = removeMask(value);
  
  return numbers
    .substring(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function applyCNPJMask(value: string): string {
  const numbers = removeMask(value);
  
  return numbers
    .substring(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export function applyPhoneMask(value: string): string {
  const numbers = removeMask(value);
  
  return numbers
    .substring(0, 10)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export function applyMobileMask(value: string): string {
  const numbers = removeMask(value);
  
  return numbers
    .substring(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export function applyPhoneMaskAuto(value: string): string {
  const numbers = removeMask(value);
  
  if (numbers.length <= 10) {
    return applyPhoneMask(value);
  } else {
    return applyMobileMask(value);
  }
}

export function applyZipCodeMask(value: string): string {
  const numbers = removeMask(value);
  
  return numbers
    .substring(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export function applyRGMask(value: string): string {
  const numbers = removeMask(value);
  
  return numbers
    .substring(0, 9)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1-$2');
}

export function applyDateMask(value: string): string {
  const numbers = removeMask(value);
  
  return numbers
    .substring(0, 8)
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2');
}