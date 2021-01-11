import firebase from "../utils/firebase";

export default class Database {
  constructor(user, recipeListListener, categoryListListener) {
    this.user = user;
    this.recipesRef = firebase.ref(`users/${this.user}/recipes`);
    this.categoriesRef = firebase.ref(`users/${this.user}/categories`);

    this.recipesRef.on("value", recipeListListener);
    this.categoriesRef.on("value", categoryListListener);
  }

  addRecipe(values, user, recipeId) {
    if (recipeId) {
      this.recipesRef.child(recipeId).set({
        ...values,
      });
    } else {
      this.recipesRef.push(values);
    }
    values.categories.forEach(category => this.categoriesRef.child(category).set(1));
  }

  removeRecipe(recipeId, user) {
    return firebase.ref(`users/${user}/recipes`).child(recipeId).remove();
  }

  addCategory(category) {
    this.categoriesRef.child(category).set(1);
  }
}
