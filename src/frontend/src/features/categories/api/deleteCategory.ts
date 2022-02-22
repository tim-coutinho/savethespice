import { useMutation } from "react-query";

import { CategoryMap } from "@/features/categories";
import { Recipe, RecipeMap } from "@/features/recipes";
import { api } from "@/lib/fetch";
import { queryClient } from "@/lib/react-query";

interface DeleteCategoryResponseData {
  updatedRecipes: number[];
  failedUpdatedRecipes: number[];
}

const deleteCategory = (categoryId: number): Promise<DeleteCategoryResponseData | undefined> =>
  api.delete<DeleteCategoryResponseData>(`categories/${categoryId}`).then(([res, status]) => {
    if (status > 204) {
      throw new Error(res.message);
    }
    return res.data;
  });

export const useDeleteCategory = () =>
  useMutation(deleteCategory, {
    onMutate: (categoryId: number) => {
      const previousCategories = queryClient.getQueryData<CategoryMap>("categories");
      if (previousCategories) {
        const newCategories = new Map(previousCategories);
        newCategories.delete(categoryId);
        queryClient.setQueryData("categories", newCategories);
        return { previousCategories, categoryId };
      }
    },
    onSuccess: (responseData, _, context) => {
      const recipes = queryClient.getQueryData<RecipeMap>("recipes");
      if (recipes && responseData?.updatedRecipes) {
        responseData.updatedRecipes.forEach(recipeId => {
          const recipe = recipes.get(recipeId) as Recipe;
          recipe.categories?.splice(recipe.categories.findIndex(c => c === context.categoryId, 1));
        });
        queryClient.setQueryData("recipes", recipes);
      }
    },
    onError: (_, __, context) => {
      context?.previousCategories &&
        queryClient.setQueryData("categories", context.previousCategories);
    },
  });
