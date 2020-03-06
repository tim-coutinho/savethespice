import React from "react";


export default function Recipe({selected, handleClick, item, edit}) {
    return (
        <li className={`${selected ? "selected-recipe" : ""} recipe-wrapper`}>
            <div className="recipe" onClick={handleClick}>
                <div className="recipe-text">{item.name}</div>
                <img
                    className="recipe-img"
                    src={item.imgSrc}
                    alt={item.name}
                />
                <span onClick={edit}>Edit</span>
            </div>
        </li>
    );
}
