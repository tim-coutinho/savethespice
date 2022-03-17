import { useQuery } from "react-query";

import { Category, CategoryMap } from "@/features/categories";
import { api, privateEndpointPrefix } from "@/lib/fetch";

interface GetAllCategoriesResponseData {
  categories: Category[];
}

const getCategories = (): Promise<CategoryMap> =>
  api
    .get<GetAllCategoriesResponseData>(`${privateEndpointPrefix}categories`)
    .then(([res, status]) => {
      if (status !== 200) {
        throw new Error(res.message);
      }
      return new Map(res.data.categories.map(c => [c.categoryId, c]));
    });

export const useCategories = () => useQuery("categories", getCategories);
