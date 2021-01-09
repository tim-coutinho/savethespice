import firebase from "../utils/firebase";

export default class Database {
  constructor(userId, listener) {
    this.userId = userId;
    this.recipesRef = firebase.ref(`users/${this.userId}/recipes`);
    this.categoriesRef = firebase.ref(`users/${this.userId}/categories`);

    this.recipesRef.on("value", listener);
    this.categoriesRef.on("value", listener);
  }

  addRecipe(values, user) {
    // const [ingredients, instructions] = [{}, {}];
    const { categories } = values;
    // for (const [i, element] of values.ingredients.entries()) {
    //   ingredients[i] = element;
    // }
    // for (const [i, element] of values.instructions.entries()) {
    //   instructions[i] = element;
    // }
    if ("id" in values) {
      this.recipesRef.child(values.id).set({
        ...values,
        categories,
        // ingredients,
        // instructions,
        id: null
      });
    } else {
      this.recipesRef.push({
        ...values,
        categories,
        // ingredients,
        // instructions,
        id: null
      });
    }
  }

  removeRecipe(itemId, user) {
    const itemRef = firebase.ref(`users/${user.uid}/recipes`);
    return itemRef.child(itemId).remove();
  }
}
