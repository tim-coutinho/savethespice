import { useQuery } from "react-query";

import { ShareService } from "@/lib/fetch";

const getRecipeWithShareId = (shareId: string) =>
  ShareService.get(shareId).then(({ data }) => data);

export const useGetRecipeWithShareId = (shareId: string) =>
  useQuery(["share", shareId], () => getRecipeWithShareId(shareId));
