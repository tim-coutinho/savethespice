import { useQuery } from "react-query";

import { FormFields } from "@/features/recipes";
import { api, publicEndpointPrefix } from "@/lib/fetch";

const getRecipeWithShareId = (shareId: string) =>
  api.get<FormFields>(`${publicEndpointPrefix}share/${shareId}`).then(([res, status]) => {
    if (status !== 200) {
      throw new Error(res.message);
    }
    return res.data;
  });

export const useGetRecipeWithShareId = (shareId: string) =>
  useQuery(["share", shareId], () => getRecipeWithShareId(shareId));
