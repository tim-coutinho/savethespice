import { ColorScheme } from "@mantine/core";
import { atom, selector } from "recoil";
import { SignedInState, UNSET, View } from "../lib/common";
import { Category, Recipe } from "../types";

export const filterState = atom({ key: "filterState", default: "" });
export const itemIdToDeleteState = atom<number>({ key: "itemIdToDeleteState", default: UNSET });

export const selectedCategoryIdState = atom({
  key: "selectedCategoryIdState",
  default: UNSET,
});

export const selectedRecipeIdState = atom({
  key: "selectedRecipeIdState",
  default: UNSET,
});

export const allRecipesState = atom<Map<number, Recipe>>({
  key: "allRecipesState",
  default: new Map(),
});

export const filteredRecipesState = selector({
  key: "filteredRecipesState",
  get: ({ get }) => {
    const allRecipes = get(allRecipesState);
    const filter = get(filterState);
    const selectedCategoryId = get(selectedCategoryIdState);
    return Array.from(allRecipes)
      .filter(
        ([, recipe]) =>
          recipe.name.toLowerCase().includes(filter.toLowerCase()) &&
          (selectedCategoryId === UNSET || recipe.categories?.includes(selectedCategoryId)),
      )
      .sort(([, { createTime: time1 }], [, { createTime: time2 }]) => (time1 <= time2 ? 1 : -1));
  },
});

export const categoriesState = atom<Map<number, Category>>({
  key: "categoriesState",
  default: new Map(),
});

export const currentViewState = atom({
  key: "currentViewState",
  default: View.HOME,
});

export const modalActiveState = selector({
  key: "modalActiveState",
  get: ({ get }) => get(currentViewState).modal,
});

export const signedInState = atom({
  key: "signedInState",
  default: SignedInState.REFRESHING_ID_TOKEN,
});
