import React from "react";

export default function Recipe({ selected, handleClick, item }) {
  return (
    <li className={`${selected ? "selected-recipe" : ""} recipe-wrapper`} onClick={handleClick}>
      <div className="recipe">
        <div className="recipe-text">{item.name}</div>
        {item.imgSrc && <img className="recipe-img" src={item.imgSrc} alt={item.name} />}
      </div>
    </li>
  );
}
