import { Button, Group, Modal, Text } from "@mantine/core";
import { ReactElement, useEffect, useMemo } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import { transitionDuration, UNSET, View } from "../lib/common";
import { AsyncRequestStatus, useAsync } from "../lib/hooks";
import { deleteCategory, deleteRecipe } from "../lib/operations";
import {
  allRecipesState,
  categoriesState,
  currentViewState,
  itemToDeleteState,
  selectedCategoryIdState,
  selectedRecipeIdState,
} from "../store";
import { Recipe } from "../types";
import { FlipButton } from "./FlipButton";

export default (): ReactElement => {
  const [currentView, setCurrentView] = useRecoilState(currentViewState);
  const [selectedRecipeId, setSelectedRecipeId] = useRecoilState(selectedRecipeIdState);
  const [selectedCategoryId, setSelectedCategoryId] = useRecoilState(selectedCategoryIdState);
  const itemToDelete = useRecoilValue(itemToDeleteState);
  const setAllRecipes = useSetRecoilState(allRecipesState);
  const setAllCategories = useSetRecoilState(categoriesState);
  const [executeDeleteRecipe, deleteRecipeRequest] = useAsync(deleteRecipe);
  const [executeDeleteCategory, deleteCategoryRequest] = useAsync(deleteCategory);
  const deleteButtonDisabled = useMemo(
    () =>
      deleteRecipeRequest.status === AsyncRequestStatus.SUCCESS ||
      deleteCategoryRequest.status === AsyncRequestStatus.SUCCESS,
    [itemToDelete.id],
  );

  useEffect(() => {
    if (deleteRecipeRequest.status === AsyncRequestStatus.SUCCESS) {
      setAllRecipes(allRecipes => {
        allRecipes.delete(itemToDelete.id);
        return new Map(allRecipes);
      });
      itemToDelete.id === selectedRecipeId && setSelectedRecipeId(UNSET);
      deleteRecipeRequest.reset();
    }
  }, [deleteRecipeRequest.status]);

  useEffect(() => {
    if (deleteCategoryRequest.status === AsyncRequestStatus.SUCCESS) {
      setAllRecipes(allRecipes => {
        deleteCategoryRequest.value?.updatedRecipes.forEach(recipeId => {
          const recipe = allRecipes.get(recipeId) as Recipe;
          recipe.categories?.splice(recipe.categories.findIndex(c => c === itemToDelete.id, 1));
        });
        return new Map(allRecipes);
      });
      setAllCategories(categories => {
        categories.delete(itemToDelete.id);
        return new Map(categories);
      });
      itemToDelete.id === selectedCategoryId && setSelectedCategoryId(UNSET);
      deleteCategoryRequest.reset();
    }
  }, [deleteCategoryRequest.status]);

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
              (itemToDelete.type === "recipe" ? executeDeleteRecipe : executeDeleteCategory)(
                itemToDelete.id,
              ).finally(() => {
                setCurrentView(View.HOME);
              });
            }
          }}
          loading={
            deleteRecipeRequest.status === AsyncRequestStatus.PENDING ||
            deleteCategoryRequest.status === AsyncRequestStatus.PENDING
          }
          disabled={deleteButtonDisabled}
          sx={{ transitionDuration: `${transitionDuration}ms` }}
          border
        >
          Delete
        </FlipButton>
      </Group>
    </Modal>
  );
};
