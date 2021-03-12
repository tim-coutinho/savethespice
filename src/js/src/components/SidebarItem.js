import React from "react";
import { colors } from "../lib/common";
import Button from "./Button";

export default function SidebarItem({ category, handleClick, handleDelete, selected, classes }) {
  return (
    <li className={`${selected ? "selected-item" : ""} ${classes}`} onClick={handleClick}>
      {category}
      {category !== "All Recipes" && classes.includes("sidebar-category") && (
        <Button
          onClick={handleDelete}
          classes="category-delete-btn"
          primaryColor={colors.OD_DARK_RED}
        >
          <i className="fa fa-trash" />
        </Button>
      )}
    </li>
  );
}
