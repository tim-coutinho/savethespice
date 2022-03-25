/* eslint-disable */

import type { Recipe } from "./Recipe";

export type PutRecipesResponseData = {
  recipes: Recipe[];
  failedAdds?: string[];
  existingCategories?: number[];
  newCategories?: number[];
  categoryFailedAdds?: number[];
};
