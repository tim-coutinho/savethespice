export type Recipe = {
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
  categories?: (number | string)[];
  adaptedFrom?: string;
  yield?: number | string;
  url?: string;
};

export type Category = {
  userId: string;
  categoryId: number;
  updateTime: string;
  createTime: string;
  name: string;
};

export type RecipeMap = Map<number, Recipe>;

export type CategoryMap = Map<number, Category>;
