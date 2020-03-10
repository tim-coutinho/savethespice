import React from "react";

import "./Details.scss";

export default function Details({ item, edit, shoppingList, handleAddToShoppingList, handleRemoveFromShoppingList }) {
    return item ? (
        <div id="details">
            <img className="recipe-img" src={item.imgSrc} alt={item.name}/>
            <div>{item.name}</div>
            <div id="edit-btn" className="purple-btn" onClick={edit}>
                <i className="fa fa-pencil"/>
            </div>
            <ul id="ingredient-list">
                {["Hey", "You"].map(ingredient => {
                    const ingredientInList = shoppingList.includes(ingredient);
                    return (
                        <li key={ingredient} className="ingredient">
                        <span
                            className="ingredient-span"
                            onClick={() => ingredientInList ? handleRemoveFromShoppingList(ingredient) : handleAddToShoppingList(ingredient)}
                        >
                            {ingredientInList ? "X" : "O"}
                        </span> {ingredient}
                        </li>
                    );
                })}
            </ul>
        </div>
    ) : null;
}
