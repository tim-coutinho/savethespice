import { useMutation } from "react-query";

import { CategoriesService, DeleteCategoryResponseData, Recipe } from "@/lib/fetch";
import { queryClient } from "@/lib/react-query";
import { CategoryMap, RecipeMap } from "@/types";

const deleteCategory = (categoryId: number): Promise<DeleteCategoryResponseData | undefined> =>
  CategoriesService.deleteCategory(categoryId).then(({ data }) => data);

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
