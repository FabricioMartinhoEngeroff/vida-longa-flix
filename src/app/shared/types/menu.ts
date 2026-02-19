import { Category } from '../types/videos';

export interface Menu {
  id: string;
  title: string;
  description: string;
  cover: string;

  category: Category;

  recipe?: string;
  nutritionistTips?: string;

  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  calories?: number;
  
  favorited?: boolean;
  likesCount?: number;
}