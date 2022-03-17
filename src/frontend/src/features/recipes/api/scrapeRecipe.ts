import { useQuery } from "react-query";

import { Recipe } from "@/features/recipes";
import { api, privateEndpointPrefix } from "@/lib/fetch";

export interface ScrapeResponseData extends Omit<Recipe, "categories"> {
  categories: string[];
}

const scrapeRecipe = (url: string): Promise<ScrapeResponseData | undefined> =>
  api.get<ScrapeResponseData>(`${privateEndpointPrefix}scrape`, { url }).then(([res, status]) => {
    if (status !== 200) {
      throw new Error(res.message);
    }
    return res.data;
  });

export const useScrape = (url: string) =>
  useQuery(["scrapeRecipe", url], () => scrapeRecipe(url), { enabled: false });
