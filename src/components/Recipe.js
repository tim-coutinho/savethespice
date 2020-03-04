import React from "react";


export default function Recipe({selected, handleClick, item}) {
    return (
        <li className={`${selected ? "selected-recipe" : ""} recipe-wrapper`}>
            <div className="recipe" onClick={handleClick}>
                <div className="recipe-text">{item.name}</div>
                <img
                    className="recipe-img"
                    src={item.imgSrc}
                    // style={{height: `${imgHeight}px`, width: `${imgWidth}px`}}
                    alt={item.name}
                />
            </div>
        </li>
    );
}
