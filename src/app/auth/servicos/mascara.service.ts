import { Injectable } from '@angular/core';
import {
  removerMascara,
  aplicarMascaraCPF,
  aplicarMascaraCNPJ,
  aplicarMascaraTelefoneAuto,
  aplicarMascaraCEP,
  aplicarMascaraRG,
  aplicarMascaraData
} from '../utils/mascaras.utils';
import { TipoMascara } from '../tipos/formulario.types';

@Injectable({
  providedIn: 'root'
})
export class MascaraService {

  aplicar(valor: string, tipo: TipoMascara): string {
    if (!valor) return '';

    switch (tipo) {
      case 'cpf':
        return aplicarMascaraCPF(valor);
        
      case 'cnpj':
        return aplicarMascaraCNPJ(valor);
        
      case 'telefone':
      case 'celular':
        return aplicarMascaraTelefoneAuto(valor);
        
      case 'cep':
        return aplicarMascaraCEP(valor);
        
      case 'rg':
        return aplicarMascaraRG(valor);
        
      case 'data':
        return aplicarMascaraData(valor);
        
      default:
        return valor;
    }
  }

  remover(valor: string): string {
    return removerMascara(valor);
  }

  estaCompleto(valor: string, tipo: TipoMascara): boolean {
    const numeros = removerMascara(valor);
    
    const tamanhos: Record<TipoMascara, number> = {
      'cpf': 11,
      'cnpj': 14,
      'telefone': 10,
      'celular': 11,
      'cep': 8,
      'rg': 9,
      'data': 8
    };
    
    return numeros.length === tamanhos[tipo];
  }
}