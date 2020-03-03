import React from "react";
import Recipe from "./Recipe";
import RecipeLoader from "./RecipeLoader";

import "./RecipeList.css";


export default function RecipeList(props) {
    return props.items !== null ? (
        <ul id="recipe-list">
            {props.items.length !== 0 ? props.items.map(item => (
                <Recipe
                    key={item.id}
                    item={item}
                    handleClick={() => props.changeSelectedItem(item)}
                    selected={props.selectedItem && props.selectedItem.id === item.id}
                />)
            ) : <h2>No results found.</h2>
            }
        </ul>
    ) : Array(8).fill(0).map((_, i) => <RecipeLoader key={i}/>);
}
