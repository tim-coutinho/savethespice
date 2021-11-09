export interface Recipe {
  userId: string;
  recipeId: number;
  updateTime: string;
  createTime: string;
  name: string;
  desc?: string;
  cookTime?: string;
  imgSrc?: string;
  ingredients?: string[];
  instructions?: string[];
  categories?: number[];
  adaptedFrom?: string;
  yield?: number | string;
  url?: string;
}

export interface Category {
  userId: string;
  categoryId: number;
  updateTime: string;
  createTime: string;
  name: string;
}
