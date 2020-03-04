import React, { useEffect, useState } from "react";

import { getById } from "../utils/common.js";

import "./Header.css";


export default function Header(props) {
    const [focused, setFocused] = useState(false);

    const toggleFocus = () => {
        props.filter === "" && setFocused(!focused);
    };

    useEffect(() => {
        focused ? getById("filter").focus() : (props.filter === "" && getById("filter").blur());
    });

    return (
        <div id="header" className={focused ? "filter-focused" : ""}>
            <div id="sidebar-button" className="header-button" onClick={props.handleShiftRight}>
                <i className={`fa fa-fw fa-${props.shiftedRight ? "arrow-left" : "bars"}`}/>
            </div>
            <div id="filter-wrapper" onClick={() => !focused && toggleFocus()} className={`${focused ? "filter-focused" : ""} header-button`}>
                <input
                    id="filter"
                    onChange={props.handleFilterChange}
                    value={props.filter}
                    onBlur={toggleFocus}
                />
            </div>
            <div id="add-button" className="header-button" onClick={props.handleAdd}>
                <i className="fa fa-plus"/>
            </div>
        </div>
    );
}
