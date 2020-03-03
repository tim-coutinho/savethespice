import React from "react";


export default function Recipe(props) {
    return (
        <li className={`recipe-wrapper ${props.selected ? "selected-recipe" : ""}`}>
            <div className="recipe" onClick={props.handleClick}>
                <div className="recipe-text">{props.item.name}</div>
                <img
                    className="recipe-img"
                    src={props.item.imgSrc}
                    // style={{height: `${imgHeight}px`, width: `${imgWidth}px`}}
                    alt={props.item.name}
                />
            </div>
        </li>
    );
}
