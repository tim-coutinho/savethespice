import React from "react";

export default function Recipe({ selected, handleClick, recipe }) {
  return (
    <li className={`${selected ? "selected-recipe" : ""} recipe-wrapper`}>
      <div className="recipe" onClick={handleClick}>
        <div className="recipe-text">{recipe.name}</div>
        {recipe.imgSrc && <img className="recipe-img" src={recipe.imgSrc} alt={recipe.name} />}
      </div>
    </li>
  );
}
