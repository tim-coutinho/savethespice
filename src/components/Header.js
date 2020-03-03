import React, { useEffect, useState } from "react";


function Header(props) {
    const [focused, setFocused] = useState(false);
    const escapeListener = (e) => {
        if (e.key === "Escape") {
            document.getElementById("filter").blur();
            props.handleFilterChange({target: {value: ""}});
        }
    };

    const toggleFocus = () => {
        if (!focused) {
            setFocused(true);
        } else if (props.filter === "") {
            setFocused(false);
        }
    }

    useEffect(() => {
        focused ? document.removeEventListener("keydown", escapeListener) : document.addEventListener("keydown", escapeListener);
    }, [focused]);

    return (
        <div id="header" className={focused ? "filter-focused" : ""}>
            <div className="spacer"></div>
            <div id="filter-wrapper" className={focused && "expanded"}>
                <input id="filter" onChange={props.handleFilterChange} value={props.filter} onBlur={toggleFocus} onFocus={toggleFocus}/>
            </div>
            <button id="add-button" onClick={props.handleClick}>
                <i class="fa fa-plus"></i>
            </button>
        </div>
    );
}

export default Header;
