import {
  addCategory,
  addRecipe,
  addRecipes,
  deleteCategory,
  deleteRecipe,
  getAllCategories,
  getAllRecipes,
} from "./operations";

export default class Database {
  constructor(user, recipeListListener, categoryListListener) {
    if (user === null) {
      return;
    }
    this.recipes = {};
    this.categories = {};
    this.recipeListListener = recipeListListener;
    this.categoryListListener = categoryListListener;

    getAllRecipes().then(({ recipes }) => {
      recipes.forEach(this.updateLocalRecipes, this);
      this.fireListeners(true, false);
    });
    getAllCategories().then(({ categories }) => {
      categories.forEach(this.updateLocalCategories, this);
      this.fireListeners(false, true);
    });
  }

  fireListeners(recipes = true, categories = true) {
    recipes && this.recipeListListener(this.recipes);
    categories && this.categoryListListener(this.categories);
  }

  updateLocalDatabase(res) {
    if (!res) {
      return;
    }
    res.recipes ? res.recipes.forEach(this.updateLocalRecipes, this) : this.updateLocalRecipes(res);
    res.newCategories?.forEach(this.updateLocalCategories, this);
    this.fireListeners();
  }

  updateLocalRecipes(recipe) {
    delete recipe["existingCategories"];
    delete recipe["newCategories"];
    delete recipe["updateTime"];
    this.recipes[recipe.recipeId] = recipe;
  }

  updateLocalCategories(category) {
    this.categories[category.categoryId] = category;
  }

  async addRecipe(values, recipeId = null) {
    delete values["recipeId"];
    delete values["updateTime"];
    delete values["createTime"];
    const res = await addRecipe(values, recipeId);
    this.updateLocalDatabase(res);
  }

  async addRecipes(values) {
    const res = await addRecipes(values);
    this.updateLocalDatabase(res);
  }

  async deleteRecipe(recipeId) {
    await deleteRecipe(recipeId);
    delete this.recipes[recipeId];
    this.fireListeners(true, false);
  }

  async addCategory(category, categoryId = null) {
    if (category in this.categories) {
      return;
    }
    const res = await addCategory(category, categoryId);
    if (!res) {
      return;
    }
    this.categories[res.categoryId] = {
      ...this.categories[res.categoryId],
      name: category,
    };
    this.fireListeners(false, true);
  }

  async deleteCategory(categoryId) {
    const res = await deleteCategory(categoryId);
    delete this.categories[categoryId];
    res?.updatedRecipes?.forEach(recipeId =>
      this.recipes[recipeId].categories.splice(
        this.recipes[recipeId].categories.findIndex(c => c === categoryId, 1)
      )
    );
    this.fireListeners();
  }
}
