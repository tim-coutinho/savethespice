import { createContext } from "react";
import { Views } from "./common";

export const ViewContext = createContext({ currentView: Views.HOME, setCurrentView: () => {} });

export const RecipesContext = createContext({
  isLoading: true,
  recipes: {},
  selectedRecipeId: null,
  setSelectedRecipeId: () => {},
});

export const CategoriesContext = createContext({
  categories: {},
  categoryIdToDelete: null,
  selectedCategoryId: null,
  setCategoryIdToDelete: () => {},
  setSelectedCategoryId: () => {},
});
