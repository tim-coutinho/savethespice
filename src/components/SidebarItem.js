import React from "react";


export default function SidebarItem({category, handleClick, selected}) {
    return (
        <li className={`${selected ? "selected-item" : ""} sidebar-item`} onClick={handleClick}>
            {category}
        </li>
    );
}
