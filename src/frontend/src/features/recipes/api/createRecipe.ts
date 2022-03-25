import { useMutation } from "react-query";

import { PostRecipeRequest, RecipesService, UpsertRecipeResponseData } from "@/lib/fetch";
import { queryClient } from "@/lib/react-query";
import { CategoryMap, RecipeMap } from "@/types";
import { UNSET } from "@/utils/common";

const createRecipe = (recipe: PostRecipeRequest): Promise<UpsertRecipeResponseData> =>
  RecipesService.postRecipe(recipe).then(({ data }) => data);

export const useCreateRecipe = () =>
  useMutation(createRecipe, {
    onMutate: (recipe: PostRecipeRequest) => {
      const previousRecipes = queryClient.getQueryData<RecipeMap>("recipes");
      const previousCategories = queryClient.getQueryData<CategoryMap>("categories");

      if (previousCategories) {
        const newCategories = new Map(previousCategories);
        const categoryNamesToIds = new Map(
          Array.from(newCategories).map(([id, { name }]) => [name, id]),
        );
        recipe.categories?.forEach(c => {
          if (!categoryNamesToIds.has(c)) {
            const categoryId = Math.random();
            newCategories.set(Math.random(), {
              categoryId,
              name: c,
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString(),
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
            categories: recipe.categories?.map(c => categoryNamesToIds.get(c) || UNSET),
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString(),
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
