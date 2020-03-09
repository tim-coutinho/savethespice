import React, { useEffect, useState } from "react";

import { getById } from "../utils/common.js";

import "./Header.scss";


export default function Header(props) {
    const [focused, setFocused] = useState(false);

    const toggleFocus = () => {
        props.filter === "" && setFocused(!focused);
    };

    useEffect(() => {
        focused ? setTimeout(() => getById("filter").focus(), 50) : (props.filter === "" && getById("filter").blur());
    });

    return (
        <div id="header" className={focused ? "filter-focused" : ""}>
            <div id="sidebar-btn" className="header-btn purple-btn" onClick={() => props.handleViewChange("Sidebar")}>
                <i className={`fa fa-${props.shiftedRight ? "arrow-left" : "bars"}`}/>
            </div>
            <div id="filter-wrapper" onClick={() => !focused && toggleFocus()} className={`${focused ? "filter-focused" : ""} header-btn purple-btn`}>
                <input
                    id="filter"
                    onChange={props.handleFilterChange}
                    value={props.filter}
                    onBlur={toggleFocus}
                />
            </div>
            <div id="add-btn" className="header-btn purple-btn" onClick={() => props.handleViewChange("Add")}>
                <i className="fa fa-plus"/>
            </div>
        </div>
    );
}
