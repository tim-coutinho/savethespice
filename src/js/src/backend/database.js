export default class Database {
  constructor(user, recipeListListener, categoryListListener) {
    if (user === null) {
      return;
    }
    this.user = user;
    this.database = { [this.user]: { recipes: {}, categories: {} } };
    this.recipeListListener = recipeListListener;
    this.categoryListListener = categoryListListener;

    this.addRecipe({
      name: "Test Recipe 1",
      categories: ["cat1", "cat2"],
      instructions: ["Instruction 1", "Instruction 2"],
      ingredients: ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
    });

    this.addRecipe({
      name: "Test Recipe 2",
      categories: ["cat2", "cat3"],
      instructions: ["Instruction 1", "Instruction 2"],
      ingredients: ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
    });
  }

  addRecipe(values, recipeId) {
    recipeId = recipeId ?? Object.keys(this.database[this.user].recipes).length;

    this.database[this.user].recipes[recipeId] = values;
    values.categories?.forEach(this.addCategory.bind(this));
    this.recipeListListener({ ...this.database[this.user].recipes });
  }

  removeRecipe(recipeId) {
    delete this.database[this.user].recipes[recipeId];
    this.recipeListListener(this.database[this.user].recipes);
  }

  addCategory(category) {
    this.database[this.user].categories[category] = 1;
    this.categoryListListener(this.database[this.user].categories);
  }

  removeCategory(category) {
    delete this.database[this.user].categories[category];
    this.categoryListListener(this.database[this.user].categories);
  }
}
