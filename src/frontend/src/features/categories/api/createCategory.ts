import { useMutation } from "react-query";

import { CategoriesService, Category } from "@/lib/fetch";
import { queryClient } from "@/lib/react-query";
import { CategoryMap } from "@/types";

const createCategory = (name: string): Promise<Category> =>
  CategoriesService.postCategory({ name }).then(({ data }) => data);

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
