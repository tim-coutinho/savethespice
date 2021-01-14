import React, { useEffect, useRef, useState } from "react";

import Button from "./Button";

import "./Header.scss";

export default function Header({
  category,
  filter,
  handleFilterChange,
  handleViewChange,
  shiftedRight,
}) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);

  const toggleFocus = () => {
    filter === "" && setFocused(!focused);
  };

  useEffect(() => {
    focused
      ? setTimeout(() => inputRef.current.focus(), 50)
      : filter === "" && inputRef.current.blur();
  }, [focused]);

  return (
    <div id="header" className={focused ? "filter-focused" : ""}>
      <span
        style={{
          transition: "300ms",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "40px",
        }}
      >
        <Button id="sidebar-btn" classes="header-btn" onClick={handleViewChange("Sidebar")}>
          <i className={`fa fa-${shiftedRight ? "arrow-left" : "bars"}`} />
        </Button>
      </span>
      <span id="category-label">{category}</span>
      <span
        style={{ transition: "300ms", display: "flex", justifyContent: "flex-end", width: "auto" }}
      >
        <Button
          id="filter-wrapper"
          onClick={() => !focused && toggleFocus()}
          classes={`${focused ? "filter-focused" : ""} header-btn`}
        >
          <input
            id="filter"
            onBlur={toggleFocus}
            onChange={handleFilterChange}
            ref={inputRef}
            value={filter}
          />
        </Button>
        <Button id="add-btn" classes="header-btn" onClick={handleViewChange("Add")}>
          <i className="fa fa-plus" />
        </Button>
      </span>
    </div>
  );
}
