import React from "react";
import Recipe from "./Recipe";
import RecipeLoader from "./RecipeLoader";

import "./RecipeList.css";


export default function RecipeList({items, selectedCategory, selectedRecipe, changeSelectedRecipe, handleViewChange}) {
    return items !== null ? (
        <ul id="recipe-list">
            {items.length !== 0 ? items.map(item => {
                const categories = Object.values(item.categories || {});
                return (selectedCategory === "All Recipes" || categories.includes(selectedCategory)) ? (
                    <Recipe
                        key={item.id}
                        edit={() => handleViewChange("Add", {item})}
                        item={item}
                        handleClick={() => changeSelectedRecipe(item)}
                        selected={selectedRecipe && selectedRecipe.id === item.id}
                    />) : null;
            }) : <h2>No results found.</h2>
            }
        </ul>
    ) : Array(8).fill(0).map((_, i) => <RecipeLoader key={i}/>);
}
