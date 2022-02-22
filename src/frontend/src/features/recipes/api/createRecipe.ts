import { useMutation } from "react-query";

import { CategoryMap } from "@/features/categories";
import { AddRecipeResponseData, FormFields, RecipeMap } from "@/features/recipes";
import { api } from "@/lib/fetch";
import { queryClient } from "@/lib/react-query";
import { UNSET } from "@/utils/common";

const createRecipe = (recipe: FormFields): Promise<AddRecipeResponseData> =>
  api.post<AddRecipeResponseData, FormFields>("recipes", recipe).then(([res, status]) => {
    if (status !== 200 && status !== 201) {
      throw new Error(res.message);
    }
    return res.data;
  });

export const useCreateRecipe = () =>
  useMutation(createRecipe, {
    onMutate: (recipe: FormFields) => {
      const previousRecipes = queryClient.getQueryData<RecipeMap>("recipes");
      const previousCategories = queryClient.getQueryData<CategoryMap>("categories");

      if (previousCategories) {
        const newCategories = new Map(previousCategories);
        const categoryNamesToIds = new Map(
          Array.from(newCategories).map(([id, { name }]) => [name, id]),
        );
        recipe.categories.forEach(c => {
          if (!categoryNamesToIds.has(c)) {
            const categoryId = Math.random();
            newCategories.set(Math.random(), {
              categoryId,
              name: c,
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString(),
              userId: "",
            });
            categoryNamesToIds.set(c, categoryId);
          }
        });
        queryClient.setQueryData("categories", newCategories);

        if (previousRecipes) {
          const newRecipes = new Map(previousRecipes);
          const recipeId = Math.random();
          newRecipes.set(recipeId, {
            recipeId,
            ...recipe,
            categories: recipe.categories.map(c => categoryNamesToIds.get(c) || UNSET),
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString(),
            userId: "",
          });
          queryClient.setQueryData("recipes", newRecipes);
        }
      }

      return { previousRecipes, previousCategories };
    },
    onSuccess: data => {
      const previousRecipes = queryClient.getQueryData<RecipeMap>("recipes");
      const previousCategories = queryClient.getQueryData<CategoryMap>("categories");
      previousRecipes &&
        queryClient.setQueryData("recipes", previousRecipes.set(data.recipeId, data));
      data.newCategories &&
        previousCategories &&
        queryClient.setQueryData("categories", () => {
          data.newCategories?.forEach(c => previousCategories.set(c.categoryId, c));
          return new Map(previousCategories);
        });
    },
    onError: (_, __, context) => {
      context?.previousRecipes && queryClient.setQueryData("recipes", context.previousRecipes);
      context?.previousCategories &&
        queryClient.setQueryData("categories", context.previousCategories);
    },
  });
