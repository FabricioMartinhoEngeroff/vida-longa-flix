import { Category } from './videos';

export interface Cardapio {
  id: string;
  title: string;
  description: string;
  capa: string;

  category: Category;

  receita?: string;
  dicasNutri?: string;

  proteinas?: number;
  carboidratos?: number;
  gorduras?: number;
  fibras?: number;
  calorias?: number;
  favorita?: boolean;

}
