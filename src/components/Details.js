import React from "react";


export default function Details({item}) {
    return (
        <div>
            {item.desc}
            <img className="recipe-img" src={item.imgSrc} alt={item.name}/>
        </div>
    );
}
