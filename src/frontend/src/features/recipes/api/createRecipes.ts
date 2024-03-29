import { useMutation } from "react-query";

import { PutRecipesResponse, Recipe, RecipesService } from "@/lib/fetch";
import { queryClient } from "@/lib/react-query";
import { RecipeMap } from "@/types";

const createRecipes = (recipes: Recipe[]): Promise<PutRecipesResponse> =>
  RecipesService.putRecipes(recipes).then(({ data }) => data);

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
