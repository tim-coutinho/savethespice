/* eslint-disable */

export type RecipeBase = {
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
};
