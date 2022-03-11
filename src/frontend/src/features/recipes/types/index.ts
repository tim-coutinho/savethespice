import { Category } from "@/features/categories";

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
  yields?: number | string;
  url?: string;
}

export type RecipeMap = Map<number, Recipe>;

export interface AddRecipeResponseData extends Recipe {
  existingCategories?: number[];
  newCategories?: Category[];
  categoryFailedAdds?: string[];
}

export interface FormFields
  extends Omit<Recipe, "userId" | "recipeId" | "createTime" | "updateTime" | "categories"> {
  categories: string[];
}
