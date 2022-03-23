import { FC } from "react";
import { useParams } from "react-router-dom";

import { useGetRecipeWithShareId } from "@/features/share";

export const ShareComponent: FC = () => {
  const shareId = useParams().shareId ?? "";
  const query = useGetRecipeWithShareId(shareId);

  return <>{query.data?.categories}</>;
};
