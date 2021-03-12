import { createContext } from "react";
import { Views } from "./common";

export const ViewContext = createContext(Views.HOME);

export const ImportContext = createContext({
  importString: "",
  setImportString: () => {},
  importValid: false,
  setImportValid: () => {},
  importVisible: false,
});

export const RecipesContext = createContext({
  isLoading: true,
  recipes: {},
  selectedRecipeId: null,
  setSelectedRecipeId: () => {},
});

export const CategoriesContext = createContext({
  categories: {},
  selectedCategoryId: null,
  setSelectedCategoryId: () => {},
});
