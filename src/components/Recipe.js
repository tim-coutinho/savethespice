import React from "react";


function Recipe(props) {
    return (
        <div className={`${props.selected ? "selected-recipe" : ""} recipe-wrapper`} onClick={props.onClick}>
            <li className="recipe">
                <div className="recipe-text">{props.recipe.name}</div>
                <img
                    className="recipe-img"
                    src={props.recipe.imgSrc}
                    // style={{height: `${imgHeight}px`, width: `${imgWidth}px`}}
                    alt={props.recipe.name}
                />
            </li>
        </div>
    );
}

export default Recipe;
