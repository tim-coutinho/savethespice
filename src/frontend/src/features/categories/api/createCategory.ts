import { useMutation } from "react-query";

import { Category, CategoryMap } from "@/features/categories";
import { api } from "@/lib/fetch";
import { queryClient } from "@/lib/react-query";

const createCategory = (categoryName: string, categoryId?: number): Promise<Category> => {
  const body = { name: categoryName };
  return (
    categoryId !== undefined
      ? api.put<Category, typeof body>(`categories/${categoryId}`, body)
      : api.post<Category, typeof body>("categories", body)
  ).then(([res]) => res.data);
};

export const useCreateCategory = () =>
  useMutation(createCategory, {
    onMutate: (categoryName: string) => {
      const previousCategories = queryClient.getQueryData<CategoryMap>("categories");

      if (previousCategories) {
        const categoryId = Math.random();
        const newCategories = new Map(previousCategories);
        queryClient.setQueryData(
          "categories",
          newCategories.set(categoryId, {
            categoryId,
            name: categoryName,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString(),
            userId: "",
          }),
        );
        return { previousCategories, newCategoryId: categoryId };
      }
    },
    onSuccess: (category, _, context) => {
      queryClient.setQueryData("categories", () => {
        context.previousCategories.delete(context.newCategoryId);
        return context.previousCategories.set(category.categoryId, category);
      });
    },
    onError: (_, __, context) => {
      context?.previousCategories &&
        queryClient.setQueryData("categories", context.previousCategories);
    },
  });
