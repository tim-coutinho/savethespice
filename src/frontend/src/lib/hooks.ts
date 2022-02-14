import { useRef, useState } from "react";
import { QueryClient, useMutation, useQuery, UseQueryOptions } from "react-query";
import {
  addCategory,
  addRecipe,
  addRecipes,
  deleteCategory,
  deleteRecipe,
  FormFields,
  getAllCategories,
  getAllRecipes,
  scrape,
} from "./operations";
import { Category, Recipe } from "../types";
import { UNSET } from "./common";

export const useRenderTimeout = (timeout = 300): [boolean, boolean, (inView: boolean) => void] => {
  const inFlight = useRef<boolean>(false);
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);

  const setInView = (inView: boolean) => {
    setVisible(inView);
    if (inView) {
      inFlight.current = false;
      setRendered(true);
    } else {
      inFlight.current = true;
      setTimeout(() => inFlight.current && setRendered(false), timeout);
    }
  };
  return [visible, rendered, setInView];
};

export const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

export const useRecipes = () => useQuery("recipes", getAllRecipes);

export const useCategories = () => useQuery("categories", getAllCategories);

type UseScrapeOptions = { url: string; onSuccess: UseQueryOptions["onSuccess"] };

export const useScrape = ({ url, onSuccess }: UseScrapeOptions) =>
  useQuery(["scrape", url], () => scrape(url), {
    onSuccess,
    enabled: false,
  });

export const useAddRecipe = () =>
  useMutation(addRecipe, {
    onMutate: async (recipe: FormFields) => {
      const previousRecipes = queryClient.getQueryData<Map<number, Recipe>>("recipes");
      const previousCategories = queryClient.getQueryData<Map<number, Category>>("categories");

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
    onSuccess: async data => {
      await queryClient.invalidateQueries("categories");

      const previousRecipes = queryClient.getQueryData<Map<number, Recipe>>("recipes");
      const previousCategories = queryClient.getQueryData<Map<number, Category>>("categories");
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

type UseUpdateRecipeOptions = { recipe: FormFields; recipeId: number };

export const useUpdateRecipe = () =>
  useMutation(({ recipe, recipeId }: UseUpdateRecipeOptions) => addRecipe(recipe, recipeId));

export const useDeleteRecipe = () =>
  useMutation(deleteRecipe, {
    onMutate: async (recipeId: number) => {
      const previousRecipes = queryClient.getQueryData<Map<number, Recipe>>("recipes");
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

export const useDeleteCategory = () =>
  useMutation(deleteCategory, {
    onMutate: async (categoryId: number) => {
      const previousCategories = queryClient.getQueryData<Map<number, Category>>("categories");
      if (previousCategories) {
        const newCategories = new Map(previousCategories);
        newCategories.delete(categoryId);
        queryClient.setQueryData("categories", newCategories);
      }
      return { previousCategories, categoryId };
    },
    onSuccess: async (responseData, _, context) => {
      const recipes = queryClient.getQueryData<Map<number, Recipe>>("recipes");
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

export const useAddCategory = () =>
  useMutation(addCategory, {
    onMutate: async (categoryName: string) => {
      const previousCategories = queryClient.getQueryData<Map<number, Category>>("categories");
      const categoryId = Math.random();

      if (previousCategories) {
        const newCategories = new Map(previousCategories);
        queryClient.setQueryData(
          "categories",
          newCategories.set(categoryId, {
            categoryId,
            name: categoryName,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString(),
            userId: "",
          }),
        );
      }
      return { previousCategories };
    },
    onSuccess: async category => {
      await queryClient.invalidateQueries("categories");

      const previousCategories = queryClient.getQueryData<Map<number, Category>>("categories");
      previousCategories &&
        queryClient.setQueryData(
          "categories",
          previousCategories.set(category.categoryId, category),
        );
    },
    onError: (_, __, context) => {
      context?.previousCategories &&
        queryClient.setQueryData("categories", context.previousCategories);
    },
  });

export const useAddRecipes = () =>
  useMutation(addRecipes, {
    onMutate: async (recipes: Recipe[]) => {
      const previousRecipes = queryClient.getQueryData<Map<number, Recipe>>("recipes");
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
    onSuccess: async data => {
      await queryClient.invalidateQueries("recipes");

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
