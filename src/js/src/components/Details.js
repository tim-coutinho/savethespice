/* eslint-disable */
import React, { useContext, useEffect, useState } from "react";

import { RecipesContext } from "../lib/context";
import { colors } from "../lib/common";

import Button from "./Button";

import "./Details.scss";

export default function Details({
  handleDeleteRecipe,
  editRecipe,
  // shoppingList,
  // handleAddToShoppingList,
  // handleRemoveFromShoppingList,
}) {
  const { recipes, selectedRecipeId } = useContext(RecipesContext);
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const selectedRecipe = recipes.find(([id]) => id === selectedRecipeId)?.[1];
    selectedRecipe && setRecipe(selectedRecipe);
  }, [recipes, selectedRecipeId]);

  return recipe ? (
    <div id="details-card">
      <div id="header">
        <Button id="edit-btn" onClick={editRecipe}>
          <i className="fa fa-pencil-alt" />
        </Button>
        <Button onClick={handleDeleteRecipe} primaryColor={colors.OD_DARK_RED}>
          <i className="fa fa-trash" />
        </Button>
      </div>
      <div id="details">
        {recipe.imgSrc && <img className="recipe-img" src={recipe.imgSrc} alt={recipe.name} />}
        <div id="info">
          <h2 id="recipe-name">{recipe.name}</h2>
          {recipe.desc && <p id="recipe-desc">{recipe.desc}</p>}
          <br />
          {recipe.cookTime && (
            <div id="cook-time">
              <span className="info-field">Cook time</span>: {recipe.cookTime} min
            </div>
          )}
          {recipe.yield && (
            <div id="recipe-yield">
              <span className="info-field">Yield</span>: {recipe.yield} serving
              {recipe.yield === 1 ? "" : "s"}
            </div>
          )}
          {recipe.adaptedFrom && (
            <div id="adapted-from">
              <span className="info-field">Adapted from</span>{" "}
              <a href={recipe.url} title="View original recipe">
                {recipe.adaptedFrom}
              </a>
            </div>
          )}
        </div>
        <ul id="ingredient-list">
          {recipe.ingredients?.map((ingredient, i) => (
            <li key={`${ingredient + i}`} className="ingredient">
              {ingredient}
            </li>
          ))}
          {/*{recipe.ingredients.map((ingredient, i) => {*/}
          {/*  const ingredientInList = shoppingList.includes(ingredient);*/}
          {/*  return (*/}
          {/*    <li key={`${ingredient + i}`} className="ingredient">*/}
          {/*      <span*/}
          {/*        className="ingredient-span"*/}
          {/*        onClick={() =>*/}
          {/*          ingredientInList*/}
          {/*            ? handleRemoveFromShoppingList(ingredient)*/}
          {/*            : handleAddToShoppingList(ingredient)*/}
          {/*        }*/}
          {/*      >*/}
          {/*        {ingredientInList ? "X" : "O"}*/}
          {/*      </span>{" "}*/}
          {/*      {ingredient}*/}
          {/*    </li>*/}
          {/*  );*/}
          {/*})}*/}
        </ul>
        <ol id="instruction-list">
          {recipe.instructions?.map((instruction, i) => (
            <li key={`${instruction + i}`} className="instruction">
              {instruction}
            </li>
          ))}
        </ol>
      </div>
    </div>
  ) : null;
}
