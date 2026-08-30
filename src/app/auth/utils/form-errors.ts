import { AbstractControl } from '@angular/forms';

export function getFieldError(control: AbstractControl | null): string | null {
  if (!control || !control.touched || !control.errors) return null;

  if (control.errors['required'])  return 'Campo obrigatório';
  if (control.errors['email'])     return 'E-mail inválido';
  if (control.errors['minlength'])
    return `Mínimo de ${control.errors['minlength'].requiredLength} caracteres`;
  if (control.errors['pattern'])   return 'Telefone inválido';

  if (control.errors['senhaFraca']) {
    const requirements = control.errors['senhaFraca'].requisitosFaltando;
    if (requirements?.length > 0) return requirements[0];
    return 'A senha não atende aos requisitos de segurança';
  }

  return 'Valor inválido';
}