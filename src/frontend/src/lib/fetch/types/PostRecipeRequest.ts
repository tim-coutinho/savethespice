/* eslint-disable */

export type PostRecipeRequest = {
  name: string;
  desc?: string;
  cookTime?: string;
  yields?: string;
  ingredients?: string[];
  instructions?: string[];
  categories?: string[];
  adaptedFrom?: string;
  url?: string;
  imgSrc?: string;
};
