import { useQuery } from "react-query";

import { Recipe, RecipeMap } from "@/features/recipes";
import { api } from "@/lib/fetch";
import { UNSET } from "@/utils/common";

interface GetAllRecipesResponseData {
  recipes: Recipe[];
}

const getRecipes = (): Promise<RecipeMap> =>
  api.get<GetAllRecipesResponseData>("recipes").then(([res, status]) => {
    if (status !== 200) {
      throw new Error(res.message);
    }
    return new Map(res.data.recipes.map(r => [r.recipeId, r]));
  });

export const useRecipes = () =>
  useQuery("recipes", getRecipes, {
    placeholderData: new Map<number, Recipe>(
      Array(8)
        .fill(0)
        .map((_, i) => [
          i,
          { userId: "", recipeId: UNSET, name: "", createTime: "", updateTime: "" },
        ]),
    ),
  });