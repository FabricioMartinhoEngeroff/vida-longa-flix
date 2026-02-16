import { Injectable } from '@angular/core';
import {
  removeMask,
  applyCPFMask,
  applyCNPJMask,
  applyPhoneMaskAuto,
  applyZipCodeMask,
  applyRGMask,
  applyDateMask
} from '../utils/masks.utils';
import { MaskType } from '../types/form.types';

@Injectable({
  providedIn: 'root'
})
export class MaskService {

  apply(value: string, type: MaskType): string {
    if (!value) return '';

    switch (type) {
      case 'cpf':
        return applyCPFMask(value);
        
      case 'cnpj':
        return applyCNPJMask(value);
        
      case 'phone':
      case 'mobile':
        return applyPhoneMaskAuto(value);
        
      case 'zipcode':
        return applyZipCodeMask(value);
        
      case 'rg':
        return applyRGMask(value);
        
      case 'date':
        return applyDateMask(value);
        
      default:
        return value;
    }
  }

  remove(value: string): string {
    return removeMask(value);
  }

  isComplete(value: string, type: MaskType): boolean {
    const numbers = removeMask(value);
    
    const lengths: Record<MaskType, number> = {
      'cpf': 11,        // 123.456.789-00
      'cnpj': 14,       // 12.345.678/0001-00
      'phone': 10,      // (11) 1234-5678
      'mobile': 11,     // (11) 91234-5678
      'zipcode': 8,     // 12345-678
      'rg': 9,          // 12.345.678-9
      'date': 8         // 31/12/2024
    };
    
    return numbers.length === lengths[type];
  }
}