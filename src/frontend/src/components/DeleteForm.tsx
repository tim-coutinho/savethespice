import { ReactElement, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Color, transitionDuration, UNSET, useRenderTimeout, View } from "../lib/common";
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

export default (): ReactElement => {
  const [pending, setPending] = useState(false);
  const [type, setType] = useState("");
  const setAllRecipes = useSetRecoilState(allRecipesState);
  const setCategories = useSetRecoilState(categoriesState);
  const [currentView, setCurrentView] = useRecoilState(currentViewState);
  const [selectedRecipeId, setSelectedRecipeId] = useRecoilState(selectedRecipeIdState);
  const [selectedCategoryId, setSelectedCategoryId] = useRecoilState(selectedCategoryIdState);
  const itemIdToDelete = useRecoilValue(itemIdToDeleteState);
  const [visible, rendered, setVisible] = useRenderTimeout(transitionDuration);

  const handleDeleteRecipe = async (recipeId: number): Promise<void> => {
    if (recipeId === null) {
      return Promise.reject();
    }
    await deleteRecipe(recipeId);
    setAllRecipes(allRecipes => {
      allRecipes.delete(recipeId);
      return new Map(allRecipes);
    });
    recipeId === selectedRecipeId && setSelectedRecipeId(UNSET);
  };

  const handleDeleteCategory = async (categoryId: number): Promise<void> => {
    if (categoryId === null) {
      return Promise.reject();
    }
    const res = await deleteCategory(categoryId);
    if (res?.updatedRecipes) {
      setAllRecipes(allRecipes => {
        res.updatedRecipes.forEach(recipeId => {
          const recipe = allRecipes.get(recipeId) as Recipe;
          recipe.categories?.splice(recipe.categories.findIndex(c => c === categoryId, 1));
        });
        return new Map(allRecipes);
      });
    }
    setCategories(categories => {
      categories.delete(categoryId);
      return new Map(categories);
    });
    categoryId === +selectedCategoryId && setSelectedCategoryId(UNSET);
  };

  useEffect(() => {
    if (currentView !== View.HOME) {
      setType(currentView === View.DELETE_RECIPE ? "recipe" : "category");
    }
    setVisible(currentView === View.DELETE_RECIPE || currentView === View.DELETE_CATEGORY);
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
                  setPending(true);
                  (currentView === View.DELETE_RECIPE ? handleDeleteRecipe : handleDeleteCategory)(
                    itemIdToDelete,
                  ).finally(() => {
                    setPending(false);
                    setCurrentView(View.HOME);
                  });
                }
              }}
              primaryColor={Color.OD_DARK_RED}
              disabled={pending}
            >
              Delete
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
