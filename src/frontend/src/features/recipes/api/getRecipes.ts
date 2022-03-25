import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";

import { Recipe, RecipesService } from "@/lib/fetch";
import { signedInState } from "@/stores";
import { UNSET } from "@/utils/common";

const getRecipes = () =>
  RecipesService.getRecipes().then(res => new Map(res.data.recipes.map(r => [r.recipeId, r])));

export const useRecipes = () => {
  const signedIn = useRecoilValue(signedInState);

  return useQuery("recipes", getRecipes, {
    placeholderData: new Map<number, Recipe>(
      Array(8)
        .fill(0)
        .map((_, i) => [i, { recipeId: UNSET, name: "", createTime: "", updateTime: "" }]),
    ),
    enabled: signedIn,
  });
};
