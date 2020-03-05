import React from "react";


export default function SidebarItem({category, handleClick, selected}) {
    return (
        <li className={`${selected ? "selected-item" : ""} sidebar-item standard-text`} onClick={handleClick}>
            {category}
        </li>
    );
}
