export type ItemType = 'VIDEO' | 'MENU' | 'RECIPE' | 'PODCAST';

export interface FavoriteDTO {
  itemId: string;
  itemType: ItemType;
  createdAt: string;
}

export interface FavoriteStatusDTO {
  favorited: boolean;
  likesCount: number;
}

export interface ToggleResponseDTO {
  favorited: boolean;
  itemId: string;
  itemType: ItemType;
}