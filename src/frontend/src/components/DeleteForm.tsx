import { Button, Group, Modal, Text } from "@mantine/core";
import { ReactElement } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { UNSET, View } from "../lib/common";
import { deleteCategory, deleteRecipe } from "../lib/operations";
import { currentViewState, itemToDeleteState, selectedRecipeIdState } from "../store";
import { Category, Recipe } from "../types";
import { FlipButton } from "./FlipButton";
import { useMutation, useQueryClient } from "react-query";

export default (): ReactElement => {
  const [currentView, setCurrentView] = useRecoilState(currentViewState);
  const [selectedRecipeId, setSelectedRecipeId] = useRecoilState(selectedRecipeIdState);
  const itemToDelete = useRecoilValue(itemToDeleteState);
  const queryClient = useQueryClient();

  const deleteRecipeQuery = useMutation(deleteRecipe, {
    onMutate: async (recipeId: number) => {
      await queryClient.cancelQueries("recipes");
      const previousRecipes = queryClient.getQueryData<Map<number, Recipe>>("recipes");
      if (previousRecipes) {
        const newRecipes = new Map(previousRecipes);
        newRecipes.delete(recipeId);
        queryClient.setQueryData("recipes", newRecipes);
      }
      setCurrentView(View.HOME);
      return { previousRecipes, recipeId: itemToDelete.id };
    },
    onSuccess: (_, __, context) => {
      context.recipeId === selectedRecipeId && setSelectedRecipeId(UNSET);
    },
    onError: (_, __, context) => {
      context?.previousRecipes && queryClient.setQueryData("recipes", context.previousRecipes);
    },
  });

  const deleteCategoryQuery = useMutation(deleteCategory, {
    onMutate: async (categoryId: number) => {
      await queryClient.cancelQueries("categories");
      const previousCategories = queryClient.getQueryData<Map<number, Category>>("categories");
      if (previousCategories) {
        const newCategories = new Map(previousCategories);
        newCategories.delete(categoryId);
        queryClient.setQueryData("categories", newCategories);
      }
      setCurrentView(View.HOME);
      return { previousCategories, categoryId: itemToDelete.id };
    },
    onSuccess: async (responseData, _, context) => {
      await queryClient.cancelQueries("recipes");
      const recipes = queryClient.getQueryData<Map<number, Recipe>>("recipes");
      if (recipes && responseData?.updatedRecipes) {
        responseData.updatedRecipes.forEach(recipeId => {
          const recipe = recipes.get(recipeId) as Recipe;
          recipe.categories?.splice(recipe.categories.findIndex(c => c === itemToDelete.id, 1));
        });
        queryClient.setQueryData("recipes", recipes);
      }
      context.categoryId === selectedRecipeId && setSelectedRecipeId(UNSET);
    },
    onError: (_, __, context) => {
      context?.previousCategories &&
        queryClient.setQueryData("categories", context.previousCategories);
    },
  });

  return (
    <Modal
      title={`Permanently delete ${itemToDelete.type}?`}
      opened={currentView === View.DELETE}
      onClose={() => setCurrentView(View.HOME)}
    >
      <Text size="sm">This cannot be undone.</Text>
      <Group position="right" mt="md">
        <Button variant="default" onClick={() => setCurrentView(View.HOME)}>
          Cancel
        </Button>
        <FlipButton
          color="red"
          onClick={() => {
            if (itemToDelete.id !== -1) {
              itemToDelete.type === "recipe"
                ? deleteRecipeQuery.mutate(itemToDelete.id)
                : deleteCategoryQuery.mutate(itemToDelete.id);
            }
          }}
          sx={theme => ({ transitionDuration: `${theme.other.transitionDuration}ms` })}
          border
        >
          Delete
        </FlipButton>
      </Group>
    </Modal>
  );
};
