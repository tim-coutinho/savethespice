import React from "react";


function Header(props) {
    return (
        <div id="header">
            <i id="add-button" onClick={props.handleClick} className="material-icons">add_box</i>
        </div>
    );
}

export default Header;
