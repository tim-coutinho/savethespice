import { useQuery } from "react-query";

import { RecipeBase, RecipesService } from "@/lib/fetch";

const scrapeRecipe = (url: string): Promise<RecipeBase | undefined> =>
  RecipesService.scrapeRecipe(url).then(({ data }) => data);

export const useScrape = (url: string) =>
  useQuery(["scrapeRecipe", url], () => scrapeRecipe(url), { enabled: false });
