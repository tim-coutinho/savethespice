import React from "react";


function Details(props) {
    return (
        <div>
            {props.item.desc}
            <img className="recipe-img" src={props.item.imgSrc} alt={props.item.name}/>
        </div>
    );
}

export default Details;
