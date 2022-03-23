import { useMutation } from "react-query";

import { api, publicEndpointPrefix } from "@/lib/fetch";

interface CreateShareLinkResponseData {
  shareId: string;
  ttl: number;
}

const shareRecipe = (recipeId: number): Promise<CreateShareLinkResponseData> => {
  const body = { recipeId };
  return api
    .post<CreateShareLinkResponseData, typeof body>(`${publicEndpointPrefix}share`, body)
    .then(([res, status]) => {
      if (status !== 200 && status !== 201) {
        throw new Error(res.message);
      }
      return res.data;
    });
};

export const useShareRecipe = () => useMutation(shareRecipe);
