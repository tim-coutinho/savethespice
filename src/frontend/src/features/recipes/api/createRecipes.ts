import { useMutation } from "react-query";

import { AddRecipeResponseData, Recipe, RecipeMap } from "@/features/recipes";
import { api } from "@/lib/fetch";
import { queryClient } from "@/lib/react-query";

interface AddRecipesResponseData
  extends Pick<
    AddRecipeResponseData,
    "existingCategories" | "newCategories" | "categoryFailedAdds"
  > {
  recipes?: Recipe[];
  failedAdds?: Recipe[];
}

const createRecipes = (recipes: Recipe[]): Promise<AddRecipesResponseData> =>
  api
    .put<AddRecipesResponseData, { recipes: Recipe[] }>("recipes", { recipes })
    .then(([res, status]) => {
      if (status !== 200) {
        throw new Error(res.message);
      }
      return res.data;
    });

export const useCreateRecipes = () =>
  useMutation(createRecipes, {
    onMutate: (recipes: Recipe[]) => {
      const previousRecipes = queryClient.getQueryData<RecipeMap>("recipes");
      if (previousRecipes) {
        const newRecipes = new Map(previousRecipes);
        recipes.forEach(r => {
          const recipeId = Math.random();
          newRecipes.set(recipeId, {
            ...r,
            recipeId,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString(),
          });
        });
      }
      return { previousRecipes };
    },
    onSuccess: data => {
      data.recipes &&
        queryClient.setQueryData(
          "recipes",
          data.recipes.map(r => [r.recipeId, r]),
        );
    },
    onError: (_, __, context) => {
      context?.previousRecipes && queryClient.setQueryData("recipes", context.previousRecipes);
    },
  });
