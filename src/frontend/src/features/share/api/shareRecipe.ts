import { useMutation } from "react-query";

import { ShareRecipeResponseData, ShareService } from "@/lib/fetch";

const shareRecipe = (recipeId: number): Promise<ShareRecipeResponseData | undefined> =>
  ShareService.createShareLink({ recipeId }).then(({ data }) => data);

export const useShareRecipe = () => useMutation(shareRecipe);
