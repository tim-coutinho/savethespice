import { ReactElement, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Color, transitionDuration, UNSET, View } from "../lib/common";
import {
  allRecipesState,
  categoriesState,
  currentViewState,
  itemIdToDeleteState,
  selectedCategoryIdState,
  selectedRecipeIdState,
} from "../store";

import Button from "./Button";

import "./DeleteForm.scss";
import { deleteCategory, deleteRecipe } from "../lib/operations";
import { Recipe } from "../types";
import { AsyncRequestStatus, useAsync, useRenderTimeout } from "../lib/hooks";

export default (): ReactElement => {
  const [type, setType] = useState<"recipe" | "category" | "">("");
  const setAllRecipes = useSetRecoilState(allRecipesState);
  const setCategories = useSetRecoilState(categoriesState);
  const [currentView, setCurrentView] = useRecoilState(currentViewState);
  const [selectedRecipeId, setSelectedRecipeId] = useRecoilState(selectedRecipeIdState);
  const [selectedCategoryId, setSelectedCategoryId] = useRecoilState(selectedCategoryIdState);
  const itemIdToDelete = useRecoilValue(itemIdToDeleteState);
  const [visible, rendered, setVisible] = useRenderTimeout(transitionDuration);
  const [executeDeleteRecipe, deleteRecipeRequest] = useAsync(deleteRecipe);
  const [executeDeleteCategory, deleteCategoryRequest] = useAsync(deleteCategory);

  useEffect(() => {
    if (deleteRecipeRequest.status === AsyncRequestStatus.SUCCESS) {
      setAllRecipes(allRecipes => {
        allRecipes.delete(itemIdToDelete);
        return new Map(allRecipes);
      });
      itemIdToDelete === selectedRecipeId && setSelectedRecipeId(UNSET);
    }
  }, [deleteRecipeRequest]);

  useEffect(() => {
    if (deleteCategoryRequest.status === AsyncRequestStatus.SUCCESS) {
      setAllRecipes(allRecipes => {
        deleteCategoryRequest.value?.updatedRecipes.forEach(recipeId => {
          const recipe = allRecipes.get(recipeId) as Recipe;
          recipe.categories?.splice(recipe.categories.findIndex(c => c === itemIdToDelete, 1));
        });
        return new Map(allRecipes);
      });
      setCategories(categories => {
        categories.delete(itemIdToDelete);
        return new Map(categories);
      });
      itemIdToDelete === +selectedCategoryId && setSelectedCategoryId(UNSET);
    }
  }, [deleteCategoryRequest]);

  useEffect(() => {
    if (currentView !== View.HOME) {
      setType(currentView === View.DELETE ? "recipe" : "category");
    }
    setVisible(currentView === View.DELETE);
  }, [currentView]);

  return (
    <div
      id="delete-modal"
      className={visible ? "visible" : ""}
      style={{ transitionDuration: `${transitionDuration}ms` }}
    >
      {rendered && (
        <>
          <div style={{ fontSize: "1.125em" }}>Permanently delete {type}?</div>
          <span style={{ fontWeight: "initial" }}>This cannot be undone.</span>
          <hr />
          <div id="delete-modal-btns">
            <Button id="delete-modal-cancel" onClick={() => setCurrentView(View.HOME)} secondary>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (itemIdToDelete !== -1) {
                  (type === "recipe" ? executeDeleteRecipe : executeDeleteCategory)(
                    itemIdToDelete,
                  ).finally(() => {
                    setCurrentView(View.HOME);
                  });
                }
              }}
              primaryColor={Color.OD_DARK_RED}
              disabled={
                deleteRecipeRequest.status === AsyncRequestStatus.PENDING ||
                deleteCategoryRequest.status === AsyncRequestStatus.PENDING
              }
            >
              Delete
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
