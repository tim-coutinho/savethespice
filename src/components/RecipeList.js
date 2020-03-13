import React from "react";
import Recipe from "./Recipe";
import RecipeLoader from "./RecipeLoader";

import "./RecipeList.scss";

export default function RecipeList({
  items,
  selectedCategory,
  selectedRecipe,
  changeSelectedRecipe
}) {
  return items !== null ? (
    <ul id="recipe-list">
      {items.length !== 0 ? (
        items.map(([id, item]) => {
          const categories = Object.values(item.categories || {});
          return selectedCategory === "All Recipes" ||
            categories.includes(selectedCategory) ? (
            <Recipe
              key={id}
              item={item}
              handleClick={() => changeSelectedRecipe(id)}
              selected={selectedRecipe === id}
            />
          ) : null;
        })
      ) : (
        <h2>No results found.</h2>
      )}
    </ul>
  ) : (
    Array(8)
      .fill(0)
      .map((_, i) => <RecipeLoader key={i} />)
  );
}
