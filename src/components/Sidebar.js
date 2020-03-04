import React from "react";

import SidebarItem from "./SidebarItem.js";

import "./Sidebar.css";


export default function Sidebar({categories, changeSelectedItem, selectedItem}) {
    return (
        <div id="sidebar">
            <ul>
                {categories.map(category => (
                    <SidebarItem
                        key={category.name}
                        category={category.name}
                        handleClick={() => changeSelectedItem(category.name)}
                        selected={selectedItem === category.name}
                    />)
                )}
            </ul>
        </div>
    );
}
