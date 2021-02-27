import React, { useState } from "react";

import SidebarItem from "./SidebarItem";
import TextInput from "./TextInput";

import "./Sidebar.scss";

export default function Sidebar({
  categories,
  changeSelectedCategoryId,
  classes,
  handleAddCategory,
  handleExport,
  handleImport,
  handleSignOut,
  selectedCategoryId,
}) {
  const [addHover, setAddHover] = useState(false);
  const [floatingTextVisible, setFloatingTextVisible] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [shiftedLeft, setShiftedLeft] = useState(false);

  const triggerExport = () => {
    handleExport();
    if (floatingTextVisible) {
      return;
    }
    setFloatingTextVisible(true);
    setTimeout(() => setFloatingTextVisible(false), 2000);
  };

  const handleBlur = () => {
    setShiftedLeft(false);
    setTimeout(() => setNewCategory(""), 100);
  };

  const handleNewCategoryChange = e => {
    if (!e.key) {
      setNewCategory(e.target.value);
    } else if (e.key === "Escape") {
      handleBlur();
    } else if (e.key === "Enter" && newCategory !== "") {
      handleAddCategory(newCategory);
      setNewCategory("");
      handleBlur();
    }
  };

  return (
    <aside id="sidebar" className={classes}>
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
            }}
            onMouseEnter={() => setAddHover(true)}
            onMouseLeave={() => setAddHover(false)}
          />
        </div>
        {shiftedLeft && (
          <TextInput
            placeholder="Category Name"
            setValue={handleNewCategoryChange}
            value={newCategory}
            autofocus
            autofocusDelay={200}
          />
        )}
      </span>
      <ul id="sidebar-list">
        <SidebarItem
          key="All Recipes"
          category="All Recipes"
          classes="sidebar-item sidebar-category"
          handleClick={() => changeSelectedCategoryId("All Recipes")}
          selected={selectedCategoryId === "All Recipes"}
        />
        {Object.entries(categories)
          .sort(([, { name: name1 }], [, { name: name2 }]) => (name1 <= name2 ? 1 : -1))
          .map(([categoryId, { name }]) => (
            <SidebarItem
              key={categoryId}
              category={name}
              classes="sidebar-item sidebar-category"
              handleClick={() => changeSelectedCategoryId(categoryId)}
              selected={selectedCategoryId === categoryId}
            />
          ))}
        <hr />
        <SidebarItem
          key="Import Recipes"
          category="Import Recipes"
          classes="sidebar-item import"
          handleClick={handleImport}
        />
        <span className={`${floatingTextVisible ? "float" : ""}`} style={{ position: "relative" }}>
          <SidebarItem
            key="Export Recipes"
            category="Export Recipes"
            classes="sidebar-item export"
            handleClick={triggerExport}
          />
        </span>
        <SidebarItem
          key="Sign Out"
          category="Sign Out"
          classes="sidebar-item signout"
          handleClick={handleSignOut}
        />
      </ul>
    </aside>
  );
}
