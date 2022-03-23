import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";

import { Category, CategoryMap } from "@/features/categories";
import { api, privateEndpointPrefix } from "@/lib/fetch";
import { signedInState } from "@/stores";

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

export const useCategories = () => {
  const signedIn = useRecoilValue(signedInState);

  return useQuery("categories", getCategories, { enabled: signedIn });
};
