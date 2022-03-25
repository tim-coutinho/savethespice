import { useMutation } from "react-query";

import { PutRecipeRequest, RecipesService, UpsertRecipeResponseData } from "@/lib/fetch";

const updateRecipe = (
  recipe: PutRecipeRequest,
  recipeId: number,
): Promise<UpsertRecipeResponseData> =>
  RecipesService.putRecipe(recipeId, recipe).then(({ data }) => data);

type UseUpdateRecipeOptions = { recipe: PutRecipeRequest; recipeId: number };

export const useUpdateRecipe = () =>
  useMutation(({ recipe, recipeId }: UseUpdateRecipeOptions) => updateRecipe(recipe, recipeId));
