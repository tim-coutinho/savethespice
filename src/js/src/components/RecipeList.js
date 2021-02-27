import React, { useContext, useEffect, useRef } from "react";
import RecipeLoader from "./RecipeLoader";
import { RecipesContext } from "../utils/context";

import "./RecipeList.scss";

export default function RecipeList() {
  const ref = useRef(null);
  const { isLoading, recipes, selectedRecipeId, setSelectedRecipeId } = useContext(RecipesContext);

  useEffect(() => {
    if (!recipes || !ref.current) {
      return;
    }
    ref.current.querySelectorAll("img").forEach(target =>
      new IntersectionObserver((entries, observer) => {
        entries
          .filter(({ target, isIntersecting }) => !target.hasAttribute("src") && isIntersecting)
          .forEach(({ target }) => {
            target.setAttribute("src", target.getAttribute("data-src"));
            target.removeAttribute("data-src");
            observer.disconnect();
          });
      }).observe(target)
    );
  }, [recipes]);

  if (isLoading) {
    return (
      <ul id="recipe-list">
        {Array(7)
          .fill(0)
          .map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <RecipeLoader key={i} />
          ))}
      </ul>
    );
  }

  return (
    <ul id="recipe-list" ref={ref}>
      {recipes.length !== 0 ? (
        recipes.map(([id, recipe]) => (
          <li
            key={id}
            className={`${selectedRecipeId === id ? "selected-recipe" : ""} recipe-wrapper`}
            onClick={() => setSelectedRecipeId(id)}
          >
            <div className="recipe">
              <div className="recipe-text">{recipe.name}</div>
              {recipe.imgSrc && <img className="recipe-img" alt="" data-src={recipe.imgSrc} />}
            </div>
          </li>
        ))
      ) : (
        <h2>No recipes found.</h2>
      )}
    </ul>
  );
}
