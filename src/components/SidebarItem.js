import React from "react";

export default function SidebarItem({
  category,
  handleClick,
  selected,
  classes
}) {
  return (
    <li
      className={`${selected ? "selected-item" : ""} ${classes}`}
      onClick={handleClick}
    >
      {category}
    </li>
  );
}
