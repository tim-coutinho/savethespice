import React from "react";

import Button from "./Button";

import "./Details.scss";

export default function Details({
  recipe,
  handleDeleteRecipe,
  editRecipe,
  shoppingList,
  handleAddToShoppingList,
  handleRemoveFromShoppingList
}) {
  return recipe ? (
    <div id="details" className="card">
      <img className="recipe-img" src={recipe.imgSrc} alt={recipe.name} />
      <div id="detail-btns">
        <Button
          id="edit-btn"
          onClick={editRecipe}
          primaryColor="#C678DD"
          secondaryColor="#FFFFFF"
        >
          <i className="fa fa-pencil" />
        </Button>
        <Button
          onClick={handleDeleteRecipe}
          primaryColor="#BE5046"
          secondaryColor="#FFFFFF"
        >
          <i className="fa fa-trash" />
        </Button>
      </div>
      <div id="recipe-name">{recipe.name}</div>
      <ul id="ingredient-list">
        {["Hey", "You"].map(ingredient => {
          const ingredientInList = shoppingList.includes(ingredient);
          return (
            <li key={ingredient} className="ingredient">
              <span
                className="ingredient-span"
                onClick={() =>
                  ingredientInList
                    ? handleRemoveFromShoppingList(ingredient)
                    : handleAddToShoppingList(ingredient)
                }
              >
                {ingredientInList ? "X" : "O"}
              </span>{" "}
              {ingredient}
            </li>
          );
        })}
      </ul>
    </div>
  ) : null;
}
