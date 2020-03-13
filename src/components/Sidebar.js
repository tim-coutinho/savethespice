import React from "react";

import SidebarItem from "./SidebarItem";

import "./Sidebar.scss";

export default function Sidebar({
  categories,
  changeSelectedItem,
  selectedItem,
  classes
}) {
  const handleExport = () => {};

  const handleImport = () => {};

  return (
    <div id="sidebar" className={classes}>
      <ul id="sidebar-list">
        <li className={"sidebar-item sidebar-section"}>Categories</li>
        {categories.map(category => (
          <SidebarItem
            key={category.name}
            category={category.name}
            classes="sidebar-item sidebar-category"
            handleClick={() => changeSelectedItem(category.name)}
            selected={selectedItem === category.name}
          />
        ))}
        <hr />
        <SidebarItem
          key="Import Recipes"
          category="Import Recipes"
          classes="sidebar-item import"
          handleClick={handleImport}
        />
        <SidebarItem
          key="Export Recipes"
          category="Export Recipes"
          classes="sidebar-item export"
          handleClick={handleExport}
        />
      </ul>
    </div>
  );
}
