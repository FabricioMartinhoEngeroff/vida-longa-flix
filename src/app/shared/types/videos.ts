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

  category: Category;
  comments: Comment[];

  views: number;
  watchTime: number;

  recipe?: string;
  proteins?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  calories?: number;

  favorited?: boolean;
  likesCount?: number;
  viewsCount?: number;
}