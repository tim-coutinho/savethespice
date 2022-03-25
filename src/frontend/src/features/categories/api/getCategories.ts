import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";

import { CategoriesService } from "@/lib/fetch";
import { signedInState } from "@/stores";

const getCategories = () =>
  CategoriesService.getCategories().then(
    res => new Map(res.data.categories.map(c => [c.categoryId, c])),
  );

export const useCategories = () => {
  const signedIn = useRecoilValue(signedInState);

  return useQuery("categories", getCategories, { enabled: signedIn });
};
