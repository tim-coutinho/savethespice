import { useMutation } from "react-query";

import { RecipesService } from "@/lib/fetch";
import { queryClient } from "@/lib/react-query";
import { RecipeMap } from "@/types";

const deleteRecipe = (recipeId: number): Promise<void> =>
  RecipesService.deleteRecipe(recipeId).then(() => {});

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
