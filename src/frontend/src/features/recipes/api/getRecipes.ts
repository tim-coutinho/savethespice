import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";

import { Recipe, RecipeMap } from "@/features/recipes";
import { api, privateEndpointPrefix } from "@/lib/fetch";
import { signedInState } from "@/stores";
import { UNSET } from "@/utils/common";

interface GetAllRecipesResponseData {
  recipes: Recipe[];
}

const getRecipes = (): Promise<RecipeMap> =>
  api.get<GetAllRecipesResponseData>(`${privateEndpointPrefix}recipes`).then(([res, status]) => {
    if (status !== 200) {
      throw new Error(res.message);
    }
    return new Map(res.data.recipes.map(r => [r.recipeId, r]));
  });

export const useRecipes = () => {
  const signedIn = useRecoilValue(signedInState);

  return useQuery("recipes", getRecipes, {
    placeholderData: new Map<number, Recipe>(
      Array(8)
        .fill(0)
        .map((_, i) => [
          i,
          { userId: "", recipeId: UNSET, name: "", createTime: "", updateTime: "" },
        ]),
    ),
    enabled: signedIn,
  });
};
