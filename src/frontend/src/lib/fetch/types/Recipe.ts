/* eslint-disable */

export type Recipe = {
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
};
