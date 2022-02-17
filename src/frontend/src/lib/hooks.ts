import { useRef, useState } from "react";
import { QueryClient, useMutation, useQuery } from "react-query";

import { CategoryMap, Recipe, RecipeMap } from "@/types";

import { UNSET } from "./common";
import {
  addCategory,
  addRecipe,
  addRecipes,
  deleteCategory,
  deleteRecipe,
  forgotPassword,
  FormFields,
  getAllCategories,
  getAllRecipes,
  refreshIdToken,
  scrape,
  signIn,
  signUp,
} from "./operations";

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

export const useRecipes = () =>
  useQuery("recipes", getAllRecipes, {
    placeholderData: new Map<number, Recipe>(
      Array(8)
        .fill(0)
        .map((_, i) => [i, { userId: "", recipeId: -1, name: "", createTime: "", updateTime: "" }]),
    ),
  });

export const useCategories = () => useQuery("categories", getAllCategories);

export const useScrape = (url: string) =>
  useQuery(["scrape", url], () => scrape(url), { enabled: false });

export const useAddRecipe = () =>
  useMutation(addRecipe, {
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

type UseUpdateRecipeOptions = { recipe: FormFields; recipeId: number };

export const useUpdateRecipe = () =>
  useMutation(({ recipe, recipeId }: UseUpdateRecipeOptions) => addRecipe(recipe, recipeId));

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

export const useAddCategory = () =>
  useMutation(addCategory, {
    onMutate: (categoryName: string) => {
      const previousCategories = queryClient.getQueryData<CategoryMap>("categories");

      if (previousCategories) {
        const categoryId = Math.random();
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
        return { previousCategories, newCategoryId: categoryId };
      }
    },
    onSuccess: (category, _, context) => {
      queryClient.setQueryData("categories", () => {
        context.previousCategories.delete(context.newCategoryId);
        return context.previousCategories.set(category.categoryId, category);
      });
    },
    onError: (_, __, context) => {
      context?.previousCategories &&
        queryClient.setQueryData("categories", context.previousCategories);
    },
  });

export const useAddRecipes = () =>
  useMutation(addRecipes, {
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

export const useRefreshIdToken = () => useMutation(refreshIdToken);

type UseSignInOptions = { email: string; password: string };

export const useSignIn = () =>
  useMutation(({ email, password }: UseSignInOptions) => signIn(email, password));

type UseSignUpOptions = { email: string; password: string };

export const useSignUp = () =>
  useMutation(({ email, password }: UseSignUpOptions) => signUp(email, password));

export const useForgotPassword = () => useMutation(forgotPassword);
