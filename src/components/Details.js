import React from "react";
import {getById} from "../utils/common.js";


export default function Details(props) {

    return (
        <div>
            {props.item.desc}
            <img className="recipe-img" src={props.item.imgSrc} alt={props.item.name}/>
        </div>
    );
}
