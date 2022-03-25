/* eslint-disable */

import type { Category } from "./Category";

export type UpsertRecipeResponseData = {
  name: string;
  desc?: string;
  cookTime?: string;
  yields?: string;
  ingredients?: string[];
  instructions?: string[];
  categories?: number[];
  adaptedFrom?: string;
  url?: string;
  imgSrc?: string;
  createTime: string;
  updateTime: string;
  recipeId: number;
  existingCategories?: number[];
  newCategories?: Category[];
  categoryFailedAdds?: string[];
};
