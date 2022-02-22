import { useMutation } from "react-query";

import { AddRecipeResponseData, FormFields } from "@/features/recipes";
import { api } from "@/lib/fetch";

const updateRecipe = (recipe: FormFields, recipeId: number): Promise<AddRecipeResponseData> =>
  api
    .put<AddRecipeResponseData, FormFields>(`recipes/${recipeId}`, recipe)
    .then(([res, status]) => {
      if (status !== 200 && status !== 201) {
        throw new Error(res.message);
      }
      return res.data;
    });

type UseUpdateRecipeOptions = { recipe: FormFields; recipeId: number };

export const useUpdateRecipe = () =>
  useMutation(({ recipe, recipeId }: UseUpdateRecipeOptions) => updateRecipe(recipe, recipeId));
