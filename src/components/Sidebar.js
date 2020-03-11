import React from "react";

import SidebarItem from "./SidebarItem";

import "./Sidebar.scss";


export default function Sidebar({categories, changeSelectedItem, selectedItem, classes}) {
    return (
        <div id="sidebar" className={classes}>
            <ul>
                <li className={"sidebar-item sidebar-section"}>
                    Categories
                </li>
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
