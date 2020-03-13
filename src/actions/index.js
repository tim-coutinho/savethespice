export const addRecipe = () => ({
  type: "ADD_RECIPE"
});

export const deleteRecipe = () => ({
  type: "DELETE_RECIPE"
});

export const setView = view => ({
  type: "SET_VIEW",
  view
});
