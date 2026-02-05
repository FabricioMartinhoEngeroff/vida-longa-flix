import { Injectable } from '@angular/core';
import { TipoMascara } from '../tipos/mascara.types';
import {
  removerMascara,
  aplicarMascaraCPF,
  aplicarMascaraCNPJ,
  aplicarMascaraTelefoneAuto,
  aplicarMascaraCEP,
  aplicarMascaraRG,
  aplicarMascaraData
} from '../utils/mascaras.utils';

/**
 * Serviço responsável por gerenciar máscaras em campos de formulário
 * 
 * COMO USAR:
 * 1. Injete o serviço no componente
 * 2. Use aplicar() para formatar visualmente
 * 3. Use remover() antes de enviar ao backend
 * 
 * @example
 * constructor(private servicoMascara: MascaraService) {}
 * 
 * formatarCPF(valor: string) {
 *   return this.servicoMascara.aplicar(valor, 'cpf');
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class MascaraService {

  /**
   * Aplica máscara baseada no tipo especificado
   * @param valor - Valor digitado pelo usuário
   * @param tipo - Tipo de máscara a aplicar
   * @returns Valor formatado com máscara
   * 
   * @example
   * aplicar('12345678900', 'cpf') → '123.456.789-00'
   * aplicar('11987654321', 'telefone') → '(11) 98765-4321'
   */
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

  /**
   * Remove a máscara, deixando apenas números
   * Use este método antes de enviar dados ao backend
   * 
   * @param valor - Valor com máscara
   * @returns Apenas números
   * 
   * @example
   * remover('123.456.789-00') → '12345678900'
   * remover('(11) 98765-4321') → '11987654321'
   */
  remover(valor: string): string {
    return removerMascara(valor);
  }

  /**
   * Valida se o valor está completo para o tipo de máscara
   * @param valor - Valor com ou sem máscara
   * @param tipo - Tipo de máscara
   * @returns true se está completo, false caso contrário
   * 
   * @example
   * estaCompleto('123.456.789-00', 'cpf') → true
   * estaCompleto('123.456', 'cpf') → false
   */
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