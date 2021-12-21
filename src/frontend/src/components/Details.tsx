import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { ReactElement, useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

import { transitionDuration } from "../lib/common";
import { filteredRecipesState, itemToDeleteState, selectedRecipeIdState } from "../store";
import { Recipe } from "../types";

import "./Details.scss";
import { FlipButton } from "./FlipButton";

interface DetailsProps {
  handleDeleteRecipe: () => void;
  editRecipe: () => void;
  // shoppingList,
  // handleAddToShoppingList,
  // handleRemoveFromShoppingList,
}

export default ({ handleDeleteRecipe, editRecipe }: DetailsProps): ReactElement | null => {
  const [recipe, setRecipe] = useState({} as Recipe);
  const recipes = useRecoilValue(filteredRecipesState);
  const selectedRecipeId = useRecoilValue(selectedRecipeIdState);
  const setItemToDelete = useSetRecoilState(itemToDeleteState);

  useEffect(() => {
    const selectedRecipe = recipes.find(([id]) => id === selectedRecipeId)?.[1];
    selectedRecipe && setRecipe(selectedRecipe);
  }, [recipes, selectedRecipeId]);

  return recipe ? (
    <div id="details-card">
      <div id="header">
        <FlipButton
          onClick={editRecipe}
          sx={{ transitionDuration: `${transitionDuration}ms` }}
          length={40}
          border
          square
        >
          <Pencil1Icon width={30} height={30} />
        </FlipButton>
        <FlipButton
          onClick={() => {
            setItemToDelete({ type: "recipe", id: selectedRecipeId });
            handleDeleteRecipe();
          }}
          color="red"
          ml={10}
          sx={{ transitionDuration: `${transitionDuration}ms` }}
          length={40}
          border
          square
        >
          <TrashIcon width={30} height={30} />
        </FlipButton>
      </div>
      <div id="details">
        {recipe.imgSrc && <img className="recipe-img" src={recipe.imgSrc} alt={recipe.name} />}
        <div id="info">
          <h2 id="recipe-name">{recipe.name}</h2>
          {recipe.desc && <p id="recipe-desc">{recipe.desc}</p>}
          <hr />
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
};
