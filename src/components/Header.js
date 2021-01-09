import React, { useEffect, useRef, useState } from "react";

import Button from "./Button";

import "./Header.scss";

export default function Header({ filter, handleFilterChange, handleViewChange, shiftedRight }) {
  const ref = useRef(null);
  const [focused, setFocused] = useState(false);

  const toggleFocus = () => {
    filter === "" && setFocused(!focused);
  };

  useEffect(() => {
    focused ? setTimeout(() => ref.current.focus(), 50) : filter === "" && ref.current.blur();
  });

  return (
    <div id="header" className={focused ? "filter-focused" : ""}>
      <Button id="sidebar-btn" classes="header-btn" onClick={handleViewChange("Sidebar")}>
        <i className={`fa fa-${shiftedRight ? "arrow-left" : "bars"}`} />
      </Button>
      <Button
        id="filter-wrapper"
        onClick={() => !focused && toggleFocus()}
        classes={`${focused ? "filter-focused" : ""} header-btn`}
      >
        <input
          id="filter"
          onBlur={toggleFocus}
          onChange={handleFilterChange}
          ref={ref}
          value={filter}
        />
      </Button>
      <Button id="add-btn" classes="header-btn" onClick={handleViewChange("Add")}>
        <i className="fa fa-plus" />
      </Button>
    </div>
  );
}
