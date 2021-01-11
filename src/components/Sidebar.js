import React, { useRef, useState } from "react";

import SidebarItem from "./SidebarItem";

import "./Sidebar.scss";

export default function Sidebar({
  categories,
  changeSelectedItem,
  classes,
  handleAddCategory,
  handleExport,
  handleImport,
  selectedItem,
}) {
  const ref = useRef(null);
  const [addHover, setAddHover] = useState(false);
  const [shiftedLeft, setShiftedLeft] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const handleNewCategoryChange = e => {
    if (e.key === "Escape") {
      handleBlur();
      return;
    }
    if (e.key === "Enter" && newCategory !== "") {
      handleAddCategory(newCategory);
      setNewCategory("");
      handleBlur();
      return;
    }
    setNewCategory(e.target.value);
  };

  const handleBlur = () => {
    setShiftedLeft(false);
    setTimeout(() => setNewCategory(""), 100);
  };

  return (
    <div id="sidebar" className={classes}>
      <ul id="sidebar-list">
        <li
          id="categories-header"
          className={`sidebar-item sidebar-section ${shiftedLeft ? "shifted-left" : ""}`}
        >
          <div id="categories-header-left">
            Categories
            <i
              className={`fa${addHover ? "" : "r"} fa-plus-square`}
              onClick={() => {
                setShiftedLeft(true);
                ref.current.focus();
              }}
              onMouseEnter={() => setAddHover(true)}
              onMouseLeave={() => setAddHover(false)}
            />
          </div>
          <input
            id="categories-header-right"
            onBlur={() => newCategory === "" && handleBlur()}
            onKeyDown={handleNewCategoryChange}
            onChange={handleNewCategoryChange}
            placeholder="Category Name"
            ref={ref}
            value={newCategory}
          />
        </li>
        {categories.map(category => (
          <SidebarItem
            key={category}
            category={category}
            classes="sidebar-item sidebar-category"
            handleClick={() => changeSelectedItem(category)}
            selected={selectedItem === category}
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
