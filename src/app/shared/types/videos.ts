export interface UserComment {
  id: string;
  name: string;
}

export interface Comment {
  id: string;
  text: string;
  date: string;
  user: UserComment;
}

export interface Category {
  id: string;
  name: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  cover: string;
  category: { id: string; name: string };
  comments: any[];
  views: number;
  watchTime: number;
  recipe: string;
  protein: number;     
  carbs: number;
  fat: number;          
  fiber: number;
  calories: number;
  favorited: boolean;
  likesCount: number;
}