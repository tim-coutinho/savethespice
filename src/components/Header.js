import React, { useState } from "react";


function Header(props) {
    return (
        <div id="header">
            <input id="filter" onChange={props.handleFilterChange} value={props.filter}/>
            <button id="add-button" onClick={props.handleClick}>+</button>
            {/*<i id="add-button" onClick={props.handleClick} className="fa fa-plus-square"/>*/}
        </div>
    );
}

export default Header;
