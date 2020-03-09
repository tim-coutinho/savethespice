import React from "react";

import "./Details.scss";

export default function Details({ item, edit }) {
    return item ? (
        <div id="details">
            <img className="recipe-img" src={item.imgSrc} alt={item.name}/>
            <div>{item.name}</div>
            <div id="edit-btn" className="purple-btn" onClick={edit}>
                <i className="fa fa-pencil"/>
            </div>
            <ul style={{paddingLeft: 0, paddingTop: 20}}>
                <li style={{paddingLeft: 5}}>
                    <span>O</span> Hey
                </li>
                <li style={{paddingLeft: 5}}>
                    <span>O</span> You
                </li>
            </ul>
        </div>
    ) : null;
}
