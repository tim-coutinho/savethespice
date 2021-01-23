import React from "react";

import Button from "./Button";
import colors from "../utils/colors";

import "./Details.scss";

export default function Details({
  recipe,
  handleDeleteRecipe,
  editRecipe,
  shoppingList,
  handleAddToShoppingList,
  handleRemoveFromShoppingList,
}) {
  return recipe ? (
    <div id="details" className="card">
      {recipe.imgSrc && <img className="recipe-img" src={recipe.imgSrc} alt={recipe.name} />}
      <div id="detail-btns">
        <Button id="edit-btn" onClick={editRecipe}>
          <i className="fa fa-pencil-alt" />
        </Button>
        <Button onClick={handleDeleteRecipe} primaryColor={colors.OD_DARK_RED}>
          <i className="fa fa-trash" />
        </Button>
      </div>
      <div id="recipe-name">{recipe.name}</div>
      <div id="recipe-desc">{recipe.desc}</div>
      <ul id="ingredient-list">
        {recipe.ingredients?.map((ingredient, i) => {
          const ingredientInList = shoppingList.includes(ingredient);
          return (
            <li key={`${ingredient + i}`} className="ingredient">
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
      <ol id="instruction-list">
        {recipe.instructions?.map((instruction, i) => {
          return (
            <li key={`${instruction + i}`} className="instruction">
              {instruction}
            </li>
          );
        })}
      </ol>
    </div>
  ) : null;
}
