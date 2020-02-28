import React from "react";
import Recipe from "./Recipe";
import RecipeLoader from "./RecipeLoader";


function RecipeList(props) {
    return (
        <ul id="recipe-list">
            {props.items.length !== 0 ? props.items.map(recipe => (
                <Recipe
                    key={recipe.id}
                    recipe={recipe}
                    onClick={() => props.changeSelectedItem(recipe)}
                    selected={props.selectedItem && props.selectedItem.id === recipe.id}
                />)
            ) : Array(5).fill(0).map((_, i) => <RecipeLoader key={i}/>)
            }
        </ul>
    );
}

export default RecipeList;
