import { ReactElement, useEffect, useRef } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { allRecipesState, filteredRecipesState, selectedRecipeIdState } from "../store";

import "./RecipeList.scss";
import RecipeLoader from "./RecipeLoader";
import { AsyncRequestStatus, useAsync } from "../lib/hooks";
import { getAllRecipes } from "../lib/operations";

export default (): ReactElement => {
  const ref = useRef<HTMLUListElement>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useRecoilState(selectedRecipeIdState);
  const setAllRecipes = useSetRecoilState(allRecipesState);
  const recipes = useRecoilValue(filteredRecipesState);
  const [execute, request] = useAsync(getAllRecipes);

  useEffect(() => {
    execute();
  }, []);

  useEffect(() => {
    if (request.value) {
      setAllRecipes(new Map(request.value.recipes.map(r => [r.recipeId, r])));
    }
  }, [request]);

  useEffect(() => {
    if (!recipes) {
      return;
    }
    ref.current?.querySelectorAll("[data-src]").forEach(image =>
      new IntersectionObserver((entries, observer) => {
        entries
          .filter(({ isIntersecting }) => isIntersecting)
          .forEach(({ target }) => {
            target.setAttribute("src", target.getAttribute("data-src") as string);
            target.removeAttribute("data-src");
            observer.unobserve(target);
          });
      }).observe(image),
    );
  }, [recipes]);

  if (request.status === AsyncRequestStatus.PENDING) {
    return (
      <ul id="recipe-list">
        {Array(7)
          .fill(0)
          .map((_, i) => (
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
            className={`${selectedRecipeId === +id ? "selected-recipe" : ""} recipe-wrapper`}
            onClick={() => setSelectedRecipeId(+id)}
          >
            <div className="recipe">
              <div className="recipe-text">{recipe.name}</div>
              {recipe.imgSrc && <img className="recipe-img" alt="" data-src={recipe.imgSrc} />}
            </div>
          </li>
        ))
      ) : (
        <h2 style={{ marginLeft: "25%" }}>No recipes found.</h2>
      )}
    </ul>
  );
};
