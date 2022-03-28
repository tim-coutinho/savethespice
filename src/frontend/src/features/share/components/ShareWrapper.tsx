import { FC } from "react";
import { useParams } from "react-router-dom";

import { RecipeDetails } from "@/features/recipes";
import { useGetRecipeWithShareId } from "@/features/share";
import { Recipe } from "@/lib/fetch";

export const ShareWrapper: FC = () => {
  const shareId = useParams().shareId ?? "";
  const query = useGetRecipeWithShareId(shareId);

  return <RecipeDetails recipe={query.data as Recipe} />;
};
