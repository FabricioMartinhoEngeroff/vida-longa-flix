export interface UsuarioComentario {
  id: string;
  name: string;
}

export interface Comment {
  id: string;
  text: string;
  date: string;
  user: UsuarioComentario;
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
  capa:string

  category: Category;
  comments: Comment[];

  views: number;
  watchTime: number;

  receita?: string;
  proteinas?: number;
  carboidratos?: number;
  gorduras?: number;
  fibras?: number;
  calorias?: number;

  favorita?: boolean;
  viewsCount?: number;
}
