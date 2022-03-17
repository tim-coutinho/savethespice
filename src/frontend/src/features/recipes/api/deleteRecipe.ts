import { useMutation } from "react-query";

import { RecipeMap } from "@/features/recipes";
import { api, privateEndpointPrefix } from "@/lib/fetch";
import { queryClient } from "@/lib/react-query";

const deleteRecipe = (recipeId: number): Promise<void> =>
  api.delete(`${privateEndpointPrefix}recipes/${recipeId}`).then(([res, status]) => {
    if (status !== 204) {
      throw new Error(res.message);
    }
  });

export const useDeleteRecipe = () =>
  useMutation(deleteRecipe, {
    onMutate: (recipeId: number) => {
      const previousRecipes = queryClient.getQueryData<RecipeMap>("recipes");
      if (previousRecipes) {
        const newRecipes = new Map(previousRecipes);
        newRecipes.delete(recipeId);
        queryClient.setQueryData("recipes", newRecipes);
      }
      return { previousRecipes, recipeId };
    },
    onError: (_, __, context) => {
      context?.previousRecipes && queryClient.setQueryData("recipes", context.previousRecipes);
    },
  });
