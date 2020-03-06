import React from "react";

import "./Details.css"


export default function Details({item, edit}) {
    return (
        <>
            <img className="recipe-img" src={item.imgSrc} alt={item.name}/>
            <div id="edit-btn" className="purple-btn" onClick={edit}>
                <i className="fa fa-pencil"/>
            </div>
        </>
    );
}
