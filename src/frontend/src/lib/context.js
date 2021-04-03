import { createContext } from "react";
import { Views } from "./common";

export const ViewContext = createContext({ currentView: Views.HOME, setCurrentView: () => {} });

export const RecipesContext = createContext({
  recipesLoading: true,
  recipes: {},
  selectedRecipeId: null,
  setSelectedRecipeId: () => {},
});

export const CategoriesContext = createContext({
  categories: {},
  selectedCategoryId: null,
  setSelectedCategoryId: () => {},
});
