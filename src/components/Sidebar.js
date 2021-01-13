import React, { useRef, useState } from "react";

import SidebarItem from "./SidebarItem";
import TextInput from "./TextInput";

import "./Sidebar.scss";

export default function Sidebar({
  categories,
  changeSelectedItem,
  classes,
  handleAddCategory,
  handleExport,
  handleImport,
  handleSignOut,
  selectedItem,
}) {
  const ref = useRef(null);
  const [addHover, setAddHover] = useState(false);
  const [shiftedLeft, setShiftedLeft] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const handleNewCategoryChange = e => {
    if (e.key) {
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
    }
    setNewCategory(e.target.value);
  };

  const handleBlur = () => {
    setShiftedLeft(false);
    setTimeout(() => setNewCategory(""), 100);
  };

  return (
    <div id="sidebar" className={classes}>
      <span
        id="categories-header"
        className={`sidebar-item sidebar-section ${shiftedLeft ? "shifted-left" : ""}`}
      >
        <div id="categories-header-left">
          Categories
          <i
            className={`fa${addHover ? "" : "r"} fa-plus-square`}
            onClick={() => {
              setShiftedLeft(true);
              // ref.current.focus();
            }}
            onMouseEnter={() => setAddHover(true)}
            onMouseLeave={() => setAddHover(false)}
          />
        </div>
        <TextInput
          placeholder="Category Name"
          // ref={ref}
          setValue={handleNewCategoryChange}
          // valid={() => valid(run1Id)}
          value={newCategory}
        />
        {/*<input
                  id="categories-header-right"
                  onBlur={() => newCategory === "" && handleBlur()}
                  onKeyDown={handleNewCategoryChange}
                  onChange={handleNewCategoryChange}
                  placeholder="Category Name"
                  ref={ref}
                  value={newCategory}
                />*/}
      </span>
      <ul id="sidebar-list">
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
        <SidebarItem
          key="Sign Out"
          category="Sign Out"
          classes="sidebar-item signout"
          handleClick={handleSignOut}
        />
      </ul>
    </div>
  );
}
